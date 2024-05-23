import { Router } from "express";
import userRoutes from "./userRoutes.js";
import ratoneandoRoutes from "./ratoneandoRoutes.js";

const router = Router();

router.use("/user", userRoutes);
router.use("/ratoneando", ratoneandoRoutes);

export default router;
