import dotenv from "dotenv";
import pg from "pg";

dotenv.config();
const { Pool } = pg;

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT ?? "5432", 10),
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

export default pool;