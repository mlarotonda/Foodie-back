// routes/personaRoutes.js
import express from "express";
import PersonaController from "../controller/PersonaController.js";

const router = express.Router();

router.post("/", PersonaController.crearPersona);
router.get("/:id", PersonaController.obtenerPersona);
router.get("/", PersonaController.obtenerPersonas);
router.put("/:id", PersonaController.actualizarPersona);
router.delete("/:id", PersonaController.eliminarPersona);

export default router;
