import { db } from '../config/database.js';

export async function findSalesByCompany(companyId, filters = {}) {
  const conditions = ['sales.company_id = ?'];
  const values = [companyId];

  if (filters.distributorCompanyId) {
    conditions.push('sales.distributor_company_id = ?');
    values.push(filters.distributorCompanyId);
  }

  if (filters.zone) {
    conditions.push('sales.zone = ?');
    values.push(filters.zone);
  }

  if (filters.state) {
    conditions.push('sales.state = ?');
    values.push(filters.state);
  }

  if (filters.salesmanId) {
    conditions.push('sales.user_id = ?');
    values.push(filters.salesmanId);
  }

  const sql = `
    SELECT
      sales.id,
      sales.company_id,
      sales.user_id,
      sales.distributor_company_id,
      sales.title,
      sales.amount,
      sales.zone,
      sales.state,
      sales.status,
      sales.created_at,
      sales.updated_at,
      users.name AS user_name,
      distributors.name AS distributor_name
    FROM sales
    INNER JOIN users ON users.id = sales.user_id
    LEFT JOIN companies AS distributors ON distributors.id = sales.distributor_company_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY sales.created_at DESC
  `;

  const [rows] = await db.execute(sql, values);

  return rows;
}

export async function findSaleByIdAndCompany(saleId, companyId) {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        company_id,
        user_id,
        distributor_company_id,
        title,
        amount,
        zone,
        state,
        status,
        created_at,
        updated_at
      FROM sales
      WHERE id = ? AND company_id = ?
      LIMIT 1
    `,
    [saleId, companyId]
  );

  return rows[0] || null;
}

export async function insertSale({
  companyId,
  userId,
  distributorCompanyId,
  title,
  amount,
  zone,
  state,
  status
}) {
  const [result] = await db.execute(
    `
      INSERT INTO sales (company_id, user_id, distributor_company_id, title, amount, zone, state, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [companyId, userId, distributorCompanyId, title, amount, zone, state, status]
  );

  return result.insertId;
}
