// routes/personaRoutes.js
import express from "express";
import {
  crearPersona,
  obtenerPersona,
  obtenerPersonas,
  actualizarPersona,
  eliminarPersona,
} from "../controller/PersonaController.js";

const router = express.Router();

router.post("/", crearPersona);
router.get("/:id", obtenerPersona);
router.get("/", obtenerPersonas);
router.put("/:id", actualizarPersona);
router.delete("/:id", eliminarPersona);

export default router;
