import { Sequelize } from "sequelize";
import { config } from "../config/config.js";

const connection = new Sequelize(config.dbName, config.dbUser, config.dbPassword, {
    host: config.dbHost,
    dialect: config.dbDialect,
    port: config.dbPort,
});

try {
    await connection.authenticate();
    console.log("Connection has been established succesfully");
} catch (error) {
    console.error("Unable to connect to the database", error)
}

export default connection