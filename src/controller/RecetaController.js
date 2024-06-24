import { db } from "../connection/firebaseConnection.js";
import { collection, addDoc, getDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import GeminiController from './GeminiController.js';
import RatoneandoController from "./RatoneandoController.js";
import StockController from "./StockController.js"

class RecetaController{

  generarRecetas = async (req, res) => {
    try {
      const recetas = await GeminiController.getUserRecipes(req, res);
      return recetas
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al generar recetas: ' + error.message });
    }
  };

  generarRecetasGrupal = async (req, res) => {
    try {
      const recetas = await GeminiController.getUserGuestsRecipes(req, res);
      return res.status(200).json(recetas);
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al generar recetas: ' + error.message });
    }
  };


  generarRecetasRandom = async (req, res) => {
    try {
      const recetas = await GeminiController.getRandomRecipes(req, res);
      return recetas;
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al generar recetas: ' + error.message });
    }
  };

  generarRecetasRandomGrupal = async (req, res) => {
    try {
      const recetas = await GeminiController.getRandomGuestsRecipes(req, res);
      //return res.status(200).json(recetas);
    } catch (error) {
      //return res.status(500).json({ success: false, message: 'Error al generar recetas: ' + error.message });
    }
  };

  guardarRecetaTemporal = async (req, res) => {

    const userId = req.user.id;
    const {receta, usaStock} = req.body;

    try {
      const userDocRef = await db.collection('usuarios').doc(String(userId));
  
      await userDocRef.update({
        recetaTemporal: { ...receta, usaStock }
      });
  
      console.log('Receta temporal guardada exitosamente')
      res.status(200).json({ success: true, message: 'Receta temporal guardada exitosamente' });
    } catch (error) {
      console.error('Error al guardar la receta temporal:', error.message);
      res.status(500).json({ success: false, message: 'Error al guardar la receta temporal: ' + error.message });
    }
  };
  
  eliminarRecetaTemporal = async (req, res) => {
    const userId = req.user.id;

    try {
        const userRef = db.collection('usuarios').doc(String(userId));
        const userDoc = await userRef.get();
        
        await userDoc.update({recetaTemporal: null});

        res.status(200).json({ success: true, message: 'Receta Temporal eliminada exitosamente'});
    } catch (error) {
        console.error('Error al aliminar la receta:', error.message);
        res.status(500).json({ success: false, message: 'Error al aliminar la receta: ' + error.message });
    }
  };

  // Crear una nueva receta
  crearRecetaPersonalizada = async (req, res) => {
    const userId = req.user.id;
    const receta = req.body

    try {
      await validarReceta(receta)

      // Generar el ID de la receta usando el nombre y la fecha actual
      const now = new Date();
      const fechaActual = now.toISOString().split('T')[0];// Obtener la fecha en formato yyyy-MM-dd
      const recetaId = `${recetaTemporal.name}_${fechaActual}`;

      const recetaPersonalizada = {
        ...receta,
         momentoCreacion:new Date().toISOString()
        };

      const recetarioRef = db.collection('usuarios').doc(String(userId)).collection('creadas');
      await recetarioRef.doc(recetaId).set(recetaPersonalizada);

      res.status(200).json({ success: true, message: 'Receta creada exitosamente', recetaId });
    } catch (e) {
        console.error("Error al agregar la receta: ", e.message);
        res.status(500).json({ success: false, message: 'Error al agregar la receta: ' + e.message });
    }
  };

  obtenerFavoritas = async (req, res) => {
    const userId = req.user.id;
    await obtenerRecetas(userId, 'favoritas', res);
  };

  obtenerCreadas = async (req, res) => {
    const userId = req.user.id;
    await obtenerRecetas(userId, 'creadas', res);
  };

  obtenerHistorial = async (req, res) => {
    const userId = req.user.id;
    await obtenerRecetas(userId, 'historial', res);
  };

  calcularPrecio = async (req, res) => {
    const { receta } = req.body; // La receta seleccionada desde el front

    try {
      let precioTotal = 0;

      for (const ingrediente of receta.ingredients) {
        try {
          const descripcion = await ingrediente.description.toLowerCase();
          const precioIngrediente = await RatoneandoController.obtenerPrecioIngrediente(descripcion);
          if (precioIngrediente) {

            let precioAprox = precioIngrediente; //si se mide en unidades se suma como viene

            if(ingrediente.unit!=='unidades'){
              //Se asume precio por kilo/litro y se multiplica por g/ml usados en el plato.
              precioAprox = (precioIngrediente / 1000) * ingrediente.quantity;
            }

            precioTotal += precioAprox;
          }
        } catch (error) {
          console.error(`Error al obtener el precio del ingrediente ${ingrediente.description}: ${error.message}`);        
        }
      }

      res.status(200).json({ precioEstimado: precioTotal });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al calcular el precio: ' + error.message });
    }
  };

  puntuarReceta = async (req, res) => {
    const userId = req.user.id;
    const { puntuacion, favorita } = req.body;
  
    try {
      await validarPuntuacion(puntuacion);

      const userDocRef = db.collection('usuarios').doc(String(userId));
      const docSnap = await userDocRef.get();
  
      if (!docSnap.exists) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }
  
      const userData = docSnap.data();
      const recetaTemporal = userData.recetaTemporal;
  
      if (!recetaTemporal) {
        return res.status(404).json({ success: false, message: 'No hay receta para puntuar' });
      }
  
      // Si usaStock es true, consumir productos del stock
      if (recetaTemporal.usaStock) {
        console.log("Receta usa stock. Consumiendo ingredientes");
          await StockController.consumirProductos(recetaTemporal);
      }
  
      // Crear una nueva receta con la puntuación y guardar en la colección recetas del usuario
      const recetaPuntuada = {
        ...recetaTemporal,
        puntuacion,
        favorita,
        momentoRealizacion:new Date().toISOString()
      };
  
      // Generar el ID de la receta usando el nombre y la fecha actual
      const now = new Date();
      const fechaActual = now.toISOString().split('T')[0];// Obtener la fecha en formato yyyy-MM-dd
      const recetaId = `${recetaTemporal.name}_${fechaActual}`;

      const recetasRef = db.collection('usuarios').doc(String(userId)).collection('historial');
      await recetasRef.doc(recetaId).set(recetaPuntuada);

      if(favorita){
        const favRef = db.collection('usuarios').doc(String(userId)).collection('favoritas');
        await favRef.doc(recetaId).set(recetaPuntuada);
        console.log("Receta guardada en favoritos exitosamente! ${recetaId}")
      }
  
      // Anular el campo recetaTemporal en el documento del usuario
      await userDocRef.update({
        recetaTemporal: null
      });
  
      console.log("Receta agregada al historial exitosamente! ${recetaId}")
      res.status(200).json({ success: true, message: 'Receta puntuada, stock actualizado si correspondía' });
    } catch (error) {
      console.error('Error al puntuar la receta:', error.message);
      res.status(500).json({ success: false, message: 'Error al puntuar la receta: ' + error.message });
    }
  };

}

export default new RecetaController();

// Validación de la receta
const validarReceta = (receta) => {
  if (typeof receta.titulo !== 'string' || receta.titulo.trim() === '') {
    throw new Error("El título es obligatorio y debe ser una cadena no vacía.");
  }
  if (typeof receta.instrucciones !== 'string' || receta.instrucciones.trim() === '') {
    throw new Error("Las instrucciones son obligatorias y deben ser una cadena no vacía.");
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

const validarPuntuacion = (puntuacion) =>{
  if (puntuacion !== undefined && (typeof puntuacion !== 'number' || puntuacion < 1 || puntuacion > 5)) {
    throw new Error("La puntuacion debe ser un número entre 1 y 5.");
  }
}

const obtenerRecetas = async (userId, coleccion, res) => {
  try {
      const recetasRef = db.collection('usuarios').doc(String(userId)).collection(coleccion);
      const querySnapshot = await recetasRef.get();
      const recetas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      res.status(200).json({ success: true, recetas });
  } catch (error) {
      console.error('Error al obtener las recetas de ${coleccion}:', error.message);
      res.status(500).json({ success: false, message: 'Error al obtener las recetas de ${coleccion}: ' + error.message });
  }
};