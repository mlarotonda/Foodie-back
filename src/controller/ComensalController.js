import { db } from "../connection/firebaseConnection.js";
import PersonaController from "./PersonaController.js";

class ComensalController {

   // Método para agregar un comensal a la colección grupoFamiliar de un usuario
   agregarComensal = async (req, res) => {
    const userId = req.userId;
    const { nombre, apellido, edad, restricciones } = req.body;

    try {
      // Crear persona utilizando el método crearPersona
      const personaReq = { nombre, apellido, edad, restricciones };
      const personaResult = await PersonaController.crearPersona(personaReq);
      if (personaResult.status !== 201) {
        return res.status(personaResult.status).json({ error: personaResult.error });
      }

      const persona = personaResult.data;

      // Agregar persona a la colección grupoFamiliar del usuario
      const comensalesRef = db
        .collection("usuarios")
        .doc(userId)
        .collection("grupoFamiliar")
        .doc(persona.id);

      await comensalesRef.set({
        ...persona,
        creacion: new Date().toISOString()
        });

      const docRef = db.collection("personas").doc(persona.personaId);
      await docRef.set(persona);

      console.log(`Persona ${persona.id} agregada al grupo de comensales del usuario ${userId}.`);
      res.status(201).json({ message: "Persona agregada al grupo de comensales.", persona });
    } catch (e) {
      console.error("Error al agregar la persona al grupo de comensales: ", e.message);
      res.status(400).json({ error: e.message });
    }
  };

  async actualizarComensal(req, res) {

    const userId = req.userId;
    const { nombre, apellido, edad, restricciones, personaId } = req.body;

    try {
      const persona = {
        nombre,
        apellido,
        edad,
        restricciones: restricciones || [],
      };

      //Logica de validar y actualizar persona y guardarla en a coleccion 'personas'
      PersonaController.actualizarPersona(personaId, persona)

      const comensalRef = db
        .collection("usuarios")
        .doc(userId)
        .collection("grupoFamiliar")
        .doc(personaId);

      await comensalRef.update({
        ...persona,
        timestamp: new Date().toISOString(),
      });

      console.log(
        `Persona ${personaId} actualizada en el grupo de comensales del usuario ${userId} y en la colección personas.`
      );
      res
        .status(200)
        .json({
          message:
            "Persona actualizada en el grupo de comensales y en la colección personas.",
        });
    } catch (e) {
      console.error(
        "Error al actualizar la persona en el grupo de comensales: ",
        e.message
      );
      res.status(400).json({ error: e.message });
    }
  }

  async eliminarComensal(req, res) {

    const userId = req.userId;
    const personaId = req.body;

    try {
      const comensalesRef = db
        .collection("usuarios")
        .doc(userId)
        .collection("grupoFamiliar")
        .doc(personaId);

      await comensalesRef.delete();

      PersonaController.eliminarPersona(personaId);

      console.log(
        `Persona ${personaId} eliminada del grupo de comensales del usuario ${userId} y de la colección personas.`
      );
      res
        .status(200)
        .json({
          message:
            "Persona eliminada del grupo de comensales y de la colección personas.",
        });
    } catch (e) {
      console.error(
        "Error al eliminar la persona del grupo de comensales: ",
        e.message
      );
      res.status(500).json({ error: e.message });
    }
  }

  async obtenerComensales(req, res) {

    const userId = req.userId;

    try {
      const comensalesSnapshot = await db
        .collection("usuarios")
        .doc(userId)
        .collection("grupoFamiliar")
        .get();
      const comensales = comensalesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json(comensales);
    } catch (e) {
      console.error("Error al obtener el grupo de comensales: ", e.message);
      res.status(500).json({ error: e.message });
    }
  }
}

export default new ComensalController();
