import { Router } from "express";
import GeminiController from "../controller/GeminiController.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, GeminiController.getRecipes);

export default router;