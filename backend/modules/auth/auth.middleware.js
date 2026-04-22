import crypto from 'crypto';
import { AppError } from '../../shared/app-error.js';
import { defineAbilityFor } from './ability.js';
import { verifyAuthToken } from './auth.service.js';
import { findApiKeyByKeyId, updateApiKeyLastUsed } from '../../models/api-key.model.js';
import { findUserByIdAndCompany } from '../../models/user.model.js';

/**
 * JWT-only authentication middleware.
 * Used by routes that should NOT accept API keys (users, company, etc.).
 */
export function verifyJwt(request, response, next) {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication token is required', 401));
  }

  const token = authorizationHeader.split(' ')[1];

  try {
    const decodedUser = verifyAuthToken(token);
    request.user = decodedUser;
    request.ability = defineAbilityFor(decodedUser);
    return next();
  } catch {
    return next(new AppError('Invalid or expired token', 401));
  }
}

/**
 * Combined authentication middleware that accepts either a Bearer JWT
 * or an API key via the Authorization header.
 *
 * API key format:  Authorization: x-api-key <key_id>:<key_secret>
 * JWT format:      Authorization: Bearer <token>
 *
 * Currently wired only into sales routes.
 */
export function verifyApiKeyOrJwt(request, response, next) {
  const authorizationHeader = request.headers.authorization || '';

  if (authorizationHeader.startsWith('Bearer ')) {
    return verifyJwt(request, response, next);
  }

  if (authorizationHeader.startsWith('x-api-key ')) {
    return handleApiKeyAuth(request, response, next);
  }

  return next(
    new AppError('Authentication is required. Provide a Bearer token or x-api-key.', 401)
  );
}

/**
 * Internal handler that validates an API key from the Authorization header.
 *
 * Steps:
 *  1. Parse key_id and key_secret from the header value
 *  2. Look up the api_keys row by key_id
 *  3. Check is_active and expires_at
 *  4. SHA-256 hash the provided secret and compare to stored key_hash
 *  5. Resolve the associated user (or build a minimal context from company_id)
 *  6. Attach user, ability, and apiKey to the request
 *  7. Fire-and-forget update of last_used_at
 */
async function handleApiKeyAuth(request, response, next) {
  try {
    const authorizationHeader = request.headers.authorization;
    const keyPart = authorizationHeader.slice('x-api-key '.length);
    const separatorIndex = keyPart.indexOf(':');

    if (separatorIndex === -1) {
      return next(
        new AppError('Invalid API key format. Expected: x-api-key <key_id>:<key_secret>', 401)
      );
    }

    const keyId = keyPart.slice(0, separatorIndex);
    const keySecret = keyPart.slice(separatorIndex + 1);

    if (!keyId || !keySecret) {
      return next(new AppError('Invalid API key format', 401));
    }

    // ----- look up the key -----
    const apiKey = await findApiKeyByKeyId(keyId);

    if (!apiKey) {
      return next(new AppError('Invalid API key', 401));
    }

    if (!apiKey.is_active) {
      return next(new AppError('API key is inactive', 401));
    }

    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      return next(new AppError('API key has expired', 401));
    }

    // ----- verify secret -----
    const secretHash = crypto.createHash('sha256').update(keySecret).digest('hex');

    if (secretHash !== apiKey.key_hash) {
      return next(new AppError('Invalid API key', 401));
    }

    // ----- resolve user context -----
    let user;

    if (apiKey.user_id) {
      user = await findUserByIdAndCompany(apiKey.user_id, apiKey.company_id);

      if (!user) {
        return next(new AppError('User linked to API key not found', 401));
      }
    } else {
      // No user linked — build a minimal context scoped to the company.
      // Default to MANUFACTURER_ADMIN permissions so the key can read/create sales.
      user = {
        id: null,
        company_id: apiKey.company_id,
        role: 'MANUFACTURER_ADMIN',
        name: apiKey.name || 'API Key User',
        email: null
      };
    }

    request.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company_id: Number(apiKey.company_id)
    };
    request.ability = defineAbilityFor(request.user);
    request.apiKey = apiKey;

    // Update last_used_at in the background — don't block the response
    updateApiKeyLastUsed(apiKey.id).catch(() => {});

    return next();
  } catch {
    return next(new AppError('API key authentication failed', 401));
  }
}
