import express from "express";
import router from "./routes/router.js";
import sequelize from "./connection/connection.js";
import { Recetario } from "./models/index.js";
import { config } from "./config/config.js";

const app = express();
const port = 8080;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Cambia '*' con tu dominio específico en producción
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use("/api", router);

app.use((req, res) => {
  res.status(400).send("EndPoint Not Found");
});

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

await sequelize.sync({ force: true });

app.listen(port, () => {
  console.log(`\nEl servidor esta funcionando en el puerto ${port}`);
});
