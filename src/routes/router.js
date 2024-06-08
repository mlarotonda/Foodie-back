import { Router } from "express";
import userRoutes from "./userRoutes.js";
import ratoneandoRoutes from "./ratoneandoRoutes.js";
import geminiRoutes from "./geminiRoutes.js";

const router = Router();

router.use("/user", userRoutes);
router.use("/ratoneando", ratoneandoRoutes);
router.use("/gemini", geminiRoutes);

export default router;
