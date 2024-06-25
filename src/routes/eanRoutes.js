import express from "express";
import EanController from "../controller/EanController.js";

const router = express.Router();

router.get("/ean/:ean", EanController.obtenerTipoProductoPorEAN);

export default router;
