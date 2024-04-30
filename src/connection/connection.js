import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
  }
);

try {
  await sequelize.authenticate();
  console.log("Connection has been established succesfully");
} catch (error) {
  console.error("Unable to connect to the database", error);
}

export default sequelize;
