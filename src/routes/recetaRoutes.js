import { Router } from "express";
import RecetaController from "../controller/RecetaController.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

//Recetas con stock
router.get("/user", authMiddleware, RecetaController.generarRecetas);
router.get("/user/guests", authMiddleware, RecetaController.generarRecetasGrupal)

//Recetas random
router.get("/random", authMiddleware, RecetaController.generarRecetasRandom);
router.get("/random/guests", authMiddleware, RecetaController.generarRecetasRandomGrupal);
router.get("/random/price", authMiddleware, RecetaController.calcularPrecio);

//Manejo posterior
router.post("/save", authMiddleware, RecetaController.guardarRecetaTemporal)
router.post("/score", authMiddleware, RecetaController.puntuarReceta)

export default router;