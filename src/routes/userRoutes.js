import express from "express";
import UserController from "../controller/UserController.js";

const router = express.Router();

router.post("/", UserController.crearUsuario);
router.get("/:id", UserController.obtenerUsuario);
router.get("/", UserController.obtenerUsuarios);
router.put("/:id", UserController.actualizarUsuario);
router.delete("/:id", UserController.eliminarUsuario);

export default router;
