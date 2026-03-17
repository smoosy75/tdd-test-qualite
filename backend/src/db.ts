import "dotenv/config";
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.POSTGRES_DB_URL,
});
export const query = <T = any>(text: string, params?: any[]) =>
  pool.query<T>(text, params);
