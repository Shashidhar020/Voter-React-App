import {
  findSaleByIdAndCompany,
  findSalesByCompany,
  insertSale
} from '../../models/sale.model.js';
import { AppError } from '../../shared/app-error.js';

export async function getSalesByCompany(companyId, filters) {
  return findSalesByCompany(companyId, filters);
}

export async function createSale({
  companyId,
  userId,
  distributorCompanyId = null,
  title,
  amount,
  zone,
  state,
  status
}) {
  const saleId = await insertSale({
    companyId,
    userId,
    distributorCompanyId,
    title,
    amount,
    zone,
    state,
    status
  });

  return getSaleById(saleId, companyId);
}

export async function getSaleById(saleId, companyId) {
  const sale = await findSaleByIdAndCompany(saleId, companyId);

  if (!sale) {
    throw new AppError('Sale not found', 404);
  }

  return sale;
}
