import express from "express";
import router from "./routes/router.js";
import { config } from "./config/config.js";
import { firebase } from "./connection/connection.js";


const app = express();
const port = config.serverPort;

// Conexión a firebase
console.log("Firebase app initialized:", firebase);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", router);

app.use((req, res) => {
  res.status(400).send("EndPoint Not Found");
});

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

app.listen(port, () => {
  console.log(`\nEl servidor está funcionando en el puerto ${port}`);
});
