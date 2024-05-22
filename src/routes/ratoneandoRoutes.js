import { Router } from "express";
import RatoneandoController from "../controller/RatoneandoController.js";

const router = Router();

router.get("/", RatoneandoController.getProduct);

export default router;