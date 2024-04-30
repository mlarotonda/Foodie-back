import "dotenv/config";

const serverPort = process.env.SERVER_PORT;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbDialect = process.env.DB_DIALECT;
const dbPort = process.env.DB_PORT;

const config = {
    serverPort, dbName, dbUser, dbPassword, dbHost, dbDialect, dbPort
}

export { config };