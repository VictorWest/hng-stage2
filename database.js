import mysql from 'mysql2/promise';
import 'dotenv/config'

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}
