import { Router } from "express";
const router = Router();
import { crearUsuario, eliminarUsuario, actualizarUsuario } from "../controllers/UserController";

// Rutas para el UserController
router.post("/usuarios", crearUsuario);
router.delete("/usuarios/:userId", eliminarUsuario);
router.put("/usuarios/:userId", actualizarUsuario);

export default router
