import { Router } from "express";
import userRoutes from "./userRoutes.js";
import ratoneandoRoutes from "./ratoneandoRoutes.js";
import personaRoutes from "./personaRoutes.js"
import stockRoutes from "./stockRoutes.js"
import grupoFamiliarRoutes from "../routes/grupoFamiliarRoutes.js";

const router = Router();

router.use("/usuarios", userRoutes);
router.use("/ratoneando", ratoneandoRoutes);
router.use("/personas", personaRoutes);
router.use("/stock", stockRoutes);
router.use("/grupoFamiliar", grupoFamiliarRoutes);

export default router;