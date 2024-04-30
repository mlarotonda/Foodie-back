import { Router } from "express";
import UserController from "../controller/UserController.js";

const router = Router();

// Rutas para el UserController
router.post("/usuarios", UserController.crearUsuario);
router.delete("/usuarios/:userId", UserController.eliminarUsuario);
router.put("/usuarios/:userId", UserController.actualizarUsuario);

export default router;
