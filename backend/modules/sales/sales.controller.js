import { z } from 'zod';
import { AppError } from '../../shared/app-error.js';
import { createSale, getSalesByCompany } from './sales.service.js';

const createSalesSchema = z.object({
  title: z.string().trim().min(2).max(160),
  amount: z.coerce.number().positive(),
  distributor_company_id: z.coerce.number().int().positive().nullable().optional(),
  zone: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  status: z.enum(['pending', 'paid', 'cancelled']).optional()
});

const salesFilterSchema = z.object({
  distributor_company_id: z.coerce.number().int().positive().optional(),
  zone: z.string().trim().min(2).max(100).optional(),
  state: z.string().trim().min(2).max(100).optional(),
  salesman_id: z.coerce.number().int().positive().optional()
});

function parseSchema(schema, payload) {
  const result = schema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || 'Validation failed';
    throw new AppError(message, 400);
  }

  return result.data;
}

export async function getSales(request, response) {
  const filters = parseSchema(salesFilterSchema, request.query);
  const sales = await getSalesByCompany(request.user.company_id, {
    distributorCompanyId: filters.distributor_company_id,
    zone: filters.zone,
    state: filters.state,
    salesmanId: filters.salesman_id
  });

  return response.status(200).json({
    success: true,
    data: sales
  });
}

export async function createSalesRecord(request, response) {
  const payload = parseSchema(createSalesSchema, request.body);

  const sale = await createSale({
    companyId: request.user.company_id,
    userId: request.user.id,
    distributorCompanyId: payload.distributor_company_id ?? null,
    title: payload.title,
    amount: payload.amount,
    zone: payload.zone,
    state: payload.state,
    status: payload.status || 'pending'
  });

  return response.status(201).json({
    success: true,
    message: 'Sale created successfully',
    data: sale
  });
}
