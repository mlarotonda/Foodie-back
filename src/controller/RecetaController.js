import { db } from './config/firebaseConfig';
import { collection, addDoc, getDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';

// Validación de la receta
const validarReceta = (receta) => {
  if (typeof receta.titulo !== 'string' || receta.titulo.trim() === '') {
    throw new Error("El título es obligatorio y debe ser una cadena no vacía.");
  }
  if (typeof receta.instrucciones !== 'string' || receta.instrucciones.trim() === '') {
    throw new Error("Las instrucciones son obligatorias y deben ser una cadena no vacía.");
  }
  if (receta.puntuacion !== undefined && (typeof receta.puntuacion !== 'number' || receta.puntuacion < 0 || receta.puntuacion > 5)) {
    throw new Error("La puntuacion debe ser un número entre 0 y 5.");
  }
  if (!Array.isArray(receta.ingredientes) || receta.ingredientes.length === 0) {
    throw new Error("Debe haber al menos un ingrediente.");
  }
  receta.ingredientes.forEach(ingrediente => {
    if (typeof ingrediente.ingrediente !== 'string' || ingrediente.ingrediente.trim() === '') {
      throw new Error("El ingrediente es obligatorio y debe ser una cadena no vacía.");
    }
    if (typeof ingrediente.cantidad !== 'number' || ingrediente.cantidad <= 0) {
      throw new Error("La cantidad del ingrediente debe ser un número positivo.");
    }
  });
};

// Crear una nueva receta
const crearReceta = async (receta) => {
  try {
    // Obtener todas las recetas
    const recetasSnapshot = await getDocs(collection(db, "recetas"));
    const recetas = recetasSnapshot.docs.map(doc => (doc.data()));

    // Generar nuevo recetaId
    let newId = recetas.length + 1;
    
    // Validar que el nuevo recetaId no esté en uso
    while (recetas.some(r => r.recetaId === newId)) {
      newId++;
    }
    
    receta.recetaId = newId;

    validarReceta(receta);
    
    const docRef = await addDoc(collection(db, "recetas"), receta);
    console.log("Documento escrito con ID: ", docRef.id);
  } catch (e) {
    console.error("Error al agregar el documento: ", e.message);
  }
};

// Obtener una receta por ID
const obtenerReceta = async (id) => {
  const docRef = doc(db, "recetas", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log("No se encontró el documento!");
    return null;
  }
};

// Obtener todas las recetas
const obtenerRecetas = async () => {
  const querySnapshot = await getDocs(collection(db, "recetas"));
  const recetas = [];
  querySnapshot.forEach((doc) => {
    recetas.push({ id: doc.id, ...doc.data() });
  });
  return recetas;
};

// Actualizar una receta
const actualizarReceta = async (id, recetaActualizada) => {
  try {
    validarReceta(recetaActualizada);
    const docRef = doc(db, "recetas", id);
    await updateDoc(docRef, recetaActualizada);
    console.log("Documento actualizado con éxito");
  } catch (e) {
    console.error("Error al actualizar el documento: ", e.message);
  }
};

// Eliminar una receta
const eliminarReceta = async (id) => {
  const docRef = doc(db, "recetas", id);
  try {
    await deleteDoc(docRef);
    console.log("Documento eliminado con éxito");
  } catch (e) {
    console.error("Error al eliminar el documento: ", e);
  }
};

export default new RecetaController();
