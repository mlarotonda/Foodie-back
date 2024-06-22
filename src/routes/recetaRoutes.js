import { Router } from "express";
import RecetaController from "../controller/RecetaController.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, RecetaController.generarRecetas);

export default router;