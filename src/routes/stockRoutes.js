import express from "express";
import StockController from "../controller/StockController.js";

const router = express.Router();

router.post("/:userId/ean", StockController.añadirProductoPorEAN);
router.post("/:userId/anadir",StockController.añadirProductoPorNombre);
router.get("/:userId", StockController.obtenerStock);
router.get("/:userId/:nombreProducto", StockController.obtenerProducto);
router.put("/:userId/:nombreProducto", StockController.actualizarProducto);
router.delete("/:userId/:nombreProducto", StockController.eliminarProducto);
router.post("/:userId/consumir", StockController.consumirProductos);

export default router;
