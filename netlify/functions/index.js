import express from "express";
import serverless from "serverless-http";
import router from "../../routes/router.js";
import config from "../../config/config.js";
import cors from "cors";

const app = express();

// Permite solicitudes de otro puerto
app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", router);

app.use((req, res) => {
  res.status(400).send("EndPoint Not Found");
});

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

const handler = serverless(app);

export { handler };
