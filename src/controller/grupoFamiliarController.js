import { db } from "../connection/connection.js";
import { v4 as uuidv4 } from "uuid";

const validarPersona = (persona) => {
  if (typeof persona.nombre !== "string" || persona.nombre.trim() === "") {
    throw new Error("El nombre es obligatorio y debe ser una cadena no vacía.");
  }
  if (typeof persona.apellido !== "string" || persona.apellido.trim() === "") {
    throw new Error(
      "El apellido es obligatorio y debe ser una cadena no vacía."
    );
  }
  if (!Number.isInteger(persona.edad) || persona.edad <= 0) {
    throw new Error("La edad debe ser un número entero positivo.");
  }
};

const generarIdPersona = (nombre, apellido) => {
  return `${nombre.trim().toLowerCase()}_${apellido
    .trim()
    .toLowerCase()}_${uuidv4()}`;
};

class GrupoFamiliarController {
  async añadirPersona(req, res) {
    const { userId } = req.params;
    const { nombre, apellido, edad, restricciones } = req.body;

    try {
      const persona = {
        nombre,
        apellido,
        edad,
        restricciones: restricciones || [],
      };
      validarPersona(persona);

      const timestamp = new Date().toISOString();
      const personaId = generarIdPersona(nombre, apellido);

      const grupoFamiliarRef = db
        .collection("usuarios")
        .doc(userId)
        .collection("grupoFamiliar")
        .doc(personaId);
      await grupoFamiliarRef.set({ ...persona, timestamp });

      const personaRef = db.collection("personas").doc(personaId);
      await personaRef.set({ ...persona, timestamp });

      console.log(
        `Persona ${personaId} añadida al grupo familiar del usuario ${userId} y creada en la colección personas.`
      );
      res
        .status(201)
        .json({
          message:
            "Persona añadida al grupo familiar y creada en la colección personas.",
        });
    } catch (e) {
      console.error(
        "Error al añadir la persona al grupo familiar: ",
        e.message
      );
      res.status(400).json({ error: e.message });
    }
  }

  async obtenerGrupoFamiliar(req, res) {
    const { userId } = req.params;

    try {
      const grupoFamiliarSnapshot = await db
        .collection("usuarios")
        .doc(userId)
        .collection("grupoFamiliar")
        .get();
      const grupoFamiliar = grupoFamiliarSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json(grupoFamiliar);
    } catch (e) {
      console.error("Error al obtener el grupo familiar: ", e.message);
      res.status(500).json({ error: e.message });
    }
  }

  async actualizarPersona(req, res) {
    const { userId, personaId } = req.params;
    const { nombre, apellido, edad, restricciones } = req.body;

    try {
      const persona = {
        nombre,
        apellido,
        edad,
        restricciones: restricciones || [],
      };
      validarPersona(persona);

      const grupoFamiliarRef = db
        .collection("usuarios")
        .doc(userId)
        .collection("grupoFamiliar")
        .doc(personaId);
      await grupoFamiliarRef.update({
        ...persona,
        timestamp: new Date().toISOString(),
      });

      const personaRef = db.collection("personas").doc(personaId);
      await personaRef.update({
        ...persona,
        timestamp: new Date().toISOString(),
      });

      console.log(
        `Persona ${personaId} actualizada en el grupo familiar del usuario ${userId} y en la colección personas.`
      );
      res
        .status(200)
        .json({
          message:
            "Persona actualizada en el grupo familiar y en la colección personas.",
        });
    } catch (e) {
      console.error(
        "Error al actualizar la persona en el grupo familiar: ",
        e.message
      );
      res.status(400).json({ error: e.message });
    }
  }

  async eliminarPersona(req, res) {
    const { userId, personaId } = req.params;

    try {
      const grupoFamiliarRef = db
        .collection("usuarios")
        .doc(userId)
        .collection("grupoFamiliar")
        .doc(personaId);
      await grupoFamiliarRef.delete();

      const personaRef = db.collection("personas").doc(personaId);
      await personaRef.delete();

      console.log(
        `Persona ${personaId} eliminada del grupo familiar del usuario ${userId} y de la colección personas.`
      );
      res
        .status(200)
        .json({
          message:
            "Persona eliminada del grupo familiar y de la colección personas.",
        });
    } catch (e) {
      console.error(
        "Error al eliminar la persona del grupo familiar: ",
        e.message
      );
      res.status(500).json({ error: e.message });
    }
  }
}

export default new GrupoFamiliarController();
