import {
  createCompany,
  findCompanyByCode,
  findCompanyByEmail,
  findCompanyById
} from '../../models/company.model.js';
import {
  createDistributorLink,
  findDistributorLink
} from '../../models/manufacturer-distributor-map.model.js';
import { AppError } from '../../shared/app-error.js';

export async function getCompanyById(companyId) {
  const company = await findCompanyById(companyId);

  if (!company) {
    throw new AppError('Company not found', 404);
  }

  return company;
}

async function validateCompanyUniqueness({ companyCode, email }) {
  const existingCompanyByCode = await findCompanyByCode(companyCode);

  if (existingCompanyByCode) {
    throw new AppError('Company code already exists', 409);
  }

  const existingCompanyByEmail = await findCompanyByEmail(email);

  if (existingCompanyByEmail) {
    throw new AppError('Company email already exists', 409);
  }
}

export async function createManufacturerCompany(payload) {
  await validateCompanyUniqueness(payload);

  return createCompany({
    companyCode: payload.companyCode,
    name: payload.name,
    email: payload.email,
    companyType: 'MANUFACTURER'
  });
}

export async function createDistributorCompany(payload) {
  await validateCompanyUniqueness(payload);

  return createCompany({
    companyCode: payload.companyCode,
    name: payload.name,
    email: payload.email,
    companyType: 'DISTRIBUTOR'
  });
}

export async function mapDistributorToManufacturer({ manufacturerCompanyId, distributorCompanyId }) {
  const manufacturerCompany = await findCompanyById(manufacturerCompanyId);

  if (!manufacturerCompany) {
    throw new AppError('Manufacturer company not found', 404);
  }

  if (manufacturerCompany.company_type !== 'MANUFACTURER') {
    throw new AppError('Selected manufacturer company is not a manufacturer', 400);
  }

  const distributorCompany = await findCompanyById(distributorCompanyId);

  if (!distributorCompany) {
    throw new AppError('Distributor company not found', 404);
  }

  if (distributorCompany.company_type !== 'DISTRIBUTOR') {
    throw new AppError('Selected distributor company is not a distributor', 400);
  }

  if (manufacturerCompany.id === distributorCompany.id) {
    throw new AppError('Manufacturer and distributor cannot be the same company', 400);
  }

  const existingLink = await findDistributorLink(manufacturerCompanyId, distributorCompanyId);

  if (existingLink) {
    throw new AppError('Distributor is already mapped to this manufacturer', 409);
  }

  return createDistributorLink(manufacturerCompanyId, distributorCompanyId);
}
