import { Router } from "express";
import GeminiController from "../controller/GeminiController.js";

const router = Router();

router.get("/", GeminiController.getRecipes);

export default router;