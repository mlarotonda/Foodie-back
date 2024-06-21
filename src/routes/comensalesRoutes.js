import express from "express";
import ComensalController from "../controller/ComensalController.js";

const router = express.Router();

router.post("/", ComensalController.agregarComensal);
router.get("/", ComensalController.obtenerComensales);
router.put("/", ComensalController.actualizarComensal);
router.delete("/", ComensalController.eliminarComensal);

export default router;
