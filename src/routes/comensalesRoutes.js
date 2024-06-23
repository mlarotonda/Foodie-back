import express from "express";
import ComensalController from "../controller/ComensalController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, ComensalController.agregarComensal);
router.get("/", authMiddleware, ComensalController.obtenerComensales);
router.put("/", authMiddleware, ComensalController.actualizarComensal);
router.delete("/:id", authMiddleware, ComensalController.eliminarComensal);

export default router;
