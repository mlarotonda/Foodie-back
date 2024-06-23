import { Router } from "express";
import userRoutes from "./userRoutes.js";
import personaRoutes from "./personaRoutes.js";
import stockRoutes from "./stockRoutes.js";
import comensalesRoutes from "./comensalesRoutes.js";
import eanRoutes from "./eanRoutes.js";
import recetaRoutes from "./recetaRoutes.js";

const router = Router();

router.use("/usuarios", userRoutes);
router.use("/recetas", recetaRoutes)
router.use("/personas", personaRoutes);
router.use("/stock", stockRoutes);
router.use("/comensales", comensalesRoutes);
router.use("/escaner", eanRoutes);

export default router;
