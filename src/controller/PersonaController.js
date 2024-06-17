import { db } from "../connection/connection.js";
import { v4 as uuidv4 } from "uuid";

const RestriccionesEnum = {
  CELIACO: "celiaco",
  EMBARAZADA: "embarazada",
  VEGETARIANO: "vegetariano",
  VEGANO: "vegano",
  DIABETES: "diabetes",
  KOSHER: "kosher",
  HIPERTENSION: "hipertension",
  INTOLERANTE_LACTOSA: "intolerante lactosa",
};

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
  if (!Array.isArray(persona.restricciones)) {
    throw new Error("Las restricciones deben ser un array.");
  }
  persona.restricciones.forEach((restriccion) => {
    if (!Object.values(RestriccionesEnum).includes(restriccion)) {
      throw new Error(`Restricción no válida: ${restriccion}`);
    }
  });
};

// Crear una nueva persona
export const crearPersona = async (req, res) => {
  const persona = req.body;

  try {
    validarPersona(persona);

    // Genera un nuevo ID único para la persona
    persona.personaId = uuidv4();

    const docRef = db.collection("personas").doc(persona.personaId);
    await docRef.set(persona);
    console.log("Documento escrito con ID: ", persona.personaId);
    res.status(201).json({ id: persona.personaId, ...persona });
  } catch (e) {
    console.error("Error al agregar el documento: ", e.message);
    res.status(400).json({ error: e.message });
  }
};

// Obtener una persona por ID
export const obtenerPersona = async (req, res) => {
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
export const obtenerPersonas = async (req, res) => {
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
export const actualizarPersona = async (req, res) => {
  const { id } = req.params;
  const personaActualizada = req.body;

  try {
    validarPersona(personaActualizada);
    const docRef = db.collection("personas").doc(id);
    await docRef.update(personaActualizada);
    console.log("Documento actualizado con éxito");
    res.status(200).json({ id, ...personaActualizada });
  } catch (e) {
    console.error("Error al actualizar el documento: ", e.message);
    res.status(400).json({ error: e.message });
  }
};

// Eliminar una persona
export const eliminarPersona = async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = db.collection("personas").doc(id);
    await docRef.delete();
    console.log("Documento eliminado con éxito");
    res.status(200).json({ message: "Persona eliminada con éxito" });
  } catch (e) {
    console.error("Error al eliminar el documento: ", e.message);
    res.status(500).json({ error: e.message });
  }
};
