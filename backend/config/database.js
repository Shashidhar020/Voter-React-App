import mysql from 'mysql2/promise';
import { env } from './env.js';
const isDocker = process.env.RUNNING_IN_DOCKER === "true";
export const db = mysql.createPool({
  host: isDocker ? 'host.docker.internal' : 'localhost',
  user: "root",
  password: "",
  database: "dms_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function connectDatabase() {
  await db.query('SELECT 1');
  return db;
}
