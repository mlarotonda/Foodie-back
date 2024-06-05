// personaController.js
import { db } from './config/firebaseConfig';
import { collection, addDoc, getDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';

const RestriccionesEnum = {
  CELIACO: 'celiaco',
  EMBARAZADA: 'embarazada',
  VEGETARIANO: 'vegetariano',
  VEGANO: 'vegano',
  DIABETES: 'diabetes',
  KOSHER: 'kosher',
  HIPERTENSION: 'hipertension',
  INTOLERANTE_LACTOSA: 'intolerante lactosa'
};

const validarPersona = (persona) => {
  if (typeof persona.nombre !== 'string' || persona.nombre.trim() === '') {
    throw new Error("El nombre es obligatorio y debe ser una cadena no vacía.");
  }
  if (typeof persona.apellido !== 'string' || persona.apellido.trim() === '') {
    throw new Error("El apellido es obligatorio y debe ser una cadena no vacía.");
  }
  if (!Number.isInteger(persona.edad) || persona.edad <= 0) {
    throw new Error("La edad debe ser un número entero positivo.");
  }
  if (!Array.isArray(persona.restricciones)) {
    throw new Error("Las restricciones deben ser un array.");
  }
  persona.restricciones.forEach(restriccion => {
    if (!Object.values(RestriccionesEnum).includes(restriccion)) {
      throw new Error(`Restricción no válida: ${restriccion}`);
    }
  });
};

// Crear una nueva persona
const crearPersona = async (persona) => {
    try {
        // Obtener todas las recetas
        const personasSnapshot = await getDocs(collection(db, "personas"));
        const personas = personasSnapshot.docs.map(doc => (doc.data()));
    
        // Generar nuevo recetaId
        let newId = persona.length + 1;
        
        // Validar que el nuevo recetaId no esté en uso
        while (persona.some(p => p.personaId === newId)) {
          newId++;
        }
        
        persona.personaId = newId;
    
        validarReceta(persona);
        
        const docRef = await addDoc(collection(db, "personas"), persona);
        console.log("Documento escrito con ID: ", docRef.id);
      } catch (e) {
        console.error("Error al agregar el documento: ", e.message);
      }
    };
// Obtener una persona por ID
const obtenerPersona = async (id) => {
  const docRef = doc(db, "personas", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log("No se encontró el documento!");
    return null;
  }
};

// Obtener todas las personas
const obtenerPersonas = async () => {
  const querySnapshot = await getDocs(collection(db, "personas"));
  const personas = [];
  querySnapshot.forEach((doc) => {
    personas.push({ id: doc.id, ...doc.data() });
  });
  return personas;
};

// Actualizar una persona
const actualizarPersona = async (id, personaActualizada) => {
  try {
    validarPersona(personaActualizada);
    const docRef = doc(db, "personas", id);
    await updateDoc(docRef, personaActualizada);
    console.log("Documento actualizado con éxito");
  } catch (e) {
    console.error("Error al actualizar el documento: ", e.message);
  }
};

// Eliminar una persona
const eliminarPersona = async (id) => {
  const docRef = doc(db, "personas", id);
  try {
    await deleteDoc(docRef);
    console.log("Documento eliminado con éxito");
  } catch (e) {
    console.error("Error al eliminar el documento: ", e);
  }
};

export default new PersonaController();
