import { Router } from "express";
import RecetaController from "../controller/RecetaController.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

//Recetas con stock
router.post("/user", authMiddleware, RecetaController.generarRecetas);

//Recetas random
router.get("/random", authMiddleware, RecetaController.generarRecetasRandom);

//Colecciones de recetas
router.get("/favoritas", authMiddleware, RecetaController.obtenerFavoritas);
router.get("/creadas", authMiddleware, RecetaController.obtenerCreadas);
router.get("/historial", authMiddleware, RecetaController.obtenerHistorial);

//Manejo posterior
router.get("/ver", authMiddleware, RecetaController.obtenerRecetaTemporal);
router.post("/guardar", authMiddleware, RecetaController.guardarRecetaTemporal);
router.post("/puntuar", authMiddleware, RecetaController.puntuarReceta);
router.delete("/borrar", authMiddleware, RecetaController.eliminarRecetaTemporal);

//Receta personalizada
router.post("/custom", authMiddleware, RecetaController.crearRecetaPersonalizada);

export default router;