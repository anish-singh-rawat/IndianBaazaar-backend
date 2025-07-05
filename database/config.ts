import { Pool } from "pg";
import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  port: parseInt(process.env.DB_PORT || "5432"),
});

// Initialize database tables

export const sequelize = new Sequelize(
  process.env.DB_NAME || "postgres",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "postgres",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
    timezone: "+00:00",
  },
);

export const connectToPgSqlDB = async () => {
  pool.connect((err, client, release) => {
    if (err) {
      console.error("Connection error: hai ", err);
      return;
    }

    client.query("SELECT NOW()", (err, result) => {
      release();
      if (err) {
        return console.error("Error executing query:", err);
      }
      console.log("PostgreSQL Database connected @", result.rows[0].now);
    });
  });
};
