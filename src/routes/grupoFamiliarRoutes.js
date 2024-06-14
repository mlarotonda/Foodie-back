import express from "express";
import GrupoFamiliarController from "../controller/grupoFamiliarController.js";

const router = express.Router();

router.post("/:userId", GrupoFamiliarController.añadirPersona);
router.get("/:userId", GrupoFamiliarController.obtenerGrupoFamiliar);
router.put("/:userId/:personaId", GrupoFamiliarController.actualizarPersona);
router.delete("/:userId/:personaId", GrupoFamiliarController.eliminarPersona);

export default router;
