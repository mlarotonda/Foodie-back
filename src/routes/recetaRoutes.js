import { Router } from "express";
import RecetaController from "../controller/RecetaController.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

router.get("/user", authMiddleware, RecetaController.generarRecetas);
router.get("/random", authMiddleware, RecetaController.generarRecetasRandom);

export default router;