import { db } from "../connection/firebaseConnection.js";
import { v4 as uuidv4 } from "uuid";

// Enum para las restricciones dietéticas
const RestriccionesEnum = {
  CELIACO: "Celiaquía",
  EMBARAZADA: "Embarazo",
  VEGETARIANO: "Vegetarianismo",
  VEGANO: "Veganismo",
  DIABETES: "Diabetes",
  KOSHER: "Kosher",
  HIPERTENSION: "Hipertensión",
  INTOLERANTE_LACTOSA: "Intolerancia a la lactosa",
};

// Función para validar los datos de una persona
const validarPersona = (persona) => {
  if (typeof persona.nombre !== "string" || persona.nombre.trim() === "") {
    throw new Error("El nombre es obligatorio y debe ser una cadena no vacía.");
  }
  if (typeof persona.apellido !== "string" || persona.apellido.trim() === "") {
    throw new Error("El apellido es obligatorio y debe ser una cadena no vacía.");
  }
  if (!Number.isInteger(persona.edad) || persona.edad <= 0) {
    throw new Error("La edad debe ser un número entero positivo.");
  }
  if (!Array.isArray(persona.restricciones)) {
    throw new Error("Las restricciones deben ser un array.");
  }
  persona.restricciones.forEach((restriccion) => {
    if (!Object.values(RestriccionesEnum).includes(restriccion)) {
      throw new Error(`Restricción no válida: ${restriccion}`);
    }
  });
};

// Función para generar un ID único para una persona
const generarIdPersona = (nombre, apellido) => {
  return `${nombre.trim().toLowerCase()}_${apellido.trim().toLowerCase()}_${uuidv4()}`;
};

// Clase controladora para las operaciones CRUD de persona
class PersonaController {
  // Crear una nueva persona
  crearPersona = async (personaUser) => {
    const persona = personaUser;

    try {
      validarPersona(persona);

      // Genera un nuevo ID único para la persona
      persona.personaId = generarIdPersona(persona.nombre, persona.apellido);



      console.log("Documento escrito con ID: ", persona.personaId);
      return { id: persona.personaId, ...persona  };
    } catch (e) {
      console.error("Error al agregar el documento: ", e.message);
      return { status: 400, error: e.message };
    }
  };

  // Obtener una persona por ID
  obtenerPersona = async (req, res) => {
    const { id } = req.params;

    try {
      const docRef = db.collection("personas").doc(id);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        res.status(200).json(docSnap.data());
      } else {
        console.log("No se encontró el documento!");
        res.status(404).json({ error: "Persona no encontrada" });
      }
    } catch (e) {
      console.error("Error al obtener el documento: ", e.message);
      res.status(500).json({ error: e.message });
    }
  };

  // Obtener todas las personas
  obtenerPersonas = async (res) => {
    try {
      const querySnapshot = await db.collection("personas").get();
      const personas = [];
      querySnapshot.forEach((doc) => {
        personas.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).json(personas);
    } catch (e) {
      console.error("Error al obtener los documentos: ", e.message);
      res.status(500).json({ error: e.message });
    }
  };

  // Actualizar una persona
  actualizarPersona = async (personaId, persona) => {
    const { id } = personaId;
    const personaActualizada = persona;

    try {
      validarPersona(personaActualizada);

      const docRef = db.collection("personas").doc(id);
      await docRef.update(personaActualizada);

      console.log("Persona actualizada con éxito");

      res.status(200).json({ id, ...personaActualizada });
    } catch (e) {
      console.error("Error al actualizar la persona: ", e.message);
      res.status(400).json({ error: e.message });
    }
  };

  // Eliminar una persona
  eliminarPersona = async (personaId) => {
    const { id } = personaId;

    try {
      const docRef = db.collection("personas").doc(id);
      await docRef.delete();
      console.log("Persona eliminada con éxito");
      res.status(200).json({ message: "Persona eliminada con éxito" });
    } catch (e) {
      console.error("Error al eliminar la persona: ", e.message);
      res.status(500).json({ error: e.message });
    }
  };
}

// Exportar una instancia de PersonaController
export default new PersonaController();
