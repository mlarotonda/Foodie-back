import { Router } from "express";
import RecetaController from "../controller/RecetaController.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

router.get("/user", authMiddleware, RecetaController.generarRecetas);
router.get("/random", authMiddleware, RecetaController.generarRecetasRandom);
router.get("/random/price", authMiddleware, RecetaController.calcularPrecio);
router.post("/save", authMiddleware, RecetaController.guardarRecetaTemporal)
router.post("/", authMiddleware, RecetaController.puntuarReceta)

export default router;