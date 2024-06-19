import express from "express";
import StockController from "../controller/StockController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/confirmation", authMiddleware, StockController.confirmacionUsuario)
router.get("/", authMiddleware, StockController.obtenerStock);
router.get("/:nombreProducto", authMiddleware, StockController.obtenerProducto);
router.put(
  "/:nombreProducto",
  authMiddleware,
  StockController.actualizarProducto
);
router.delete(
  "/:nombreProducto",
  authMiddleware,
  StockController.eliminarProducto
);
router.post("/consumir", authMiddleware, StockController.consumirProductos);

export default router;
