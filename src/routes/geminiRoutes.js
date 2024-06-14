import { Router } from "express";
import GeminiController2 from "../controller/GeminiController2.js";

const router = Router();

router.get("/", GeminiController2.getRecipes);

export default router;