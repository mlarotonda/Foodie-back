import { Router } from "express";
import UserController from "../controller/UserController.js";

const router = Router();

// Rutas para el UserController
router.post("/usuario", UserController.crearUsuario);
router.delete("/usuario/:userId", UserController.eliminarUsuario);
router.put("/usuario/:userId", UserController.actualizarUsuario);
router.post("/usuario/recetaId", UserController.crearReceta);

export default router;
