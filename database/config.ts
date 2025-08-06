import { Pool } from "pg";
import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER || "",
  host: process.env.DB_HOST || "",
  database: process.env.DB_NAME || "",
  password: process.env.DB_PASSWORD || "",
  port: Number(process.env.DB_PORT) || 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const sequelize = new Sequelize(
  process.env.DB_NAME || "",
  process.env.DB_USER || "",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "",
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
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
);

export const connectToPgSqlDB = async () => {
  pool.connect((err, client : any, release) => {
    if (err) {
      console.error("Connection error: hai ", err);
      return;
    }

    client.query("SELECT NOW()", (err : any, result : any) => {
      release();
      if (err) {
        return console.error("Error executing query:", err);
      }
      console.log("PostgreSQL Database connected @", result.rows[0].now);
    });
  });
};
