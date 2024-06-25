import axios from 'axios';
import admin from 'firebase-admin';
import serviceAccount from '../../firebaseServiceAccountKey.json' assert { type: "json" };

// Inicializar Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const obtenerCostoIngrediente = async (nombreIngrediente, retries = 5) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(`https://api.ratoneando.ar/?q=${nombreIngrediente}`, {
        headers: {
          'Referer': 'https://ratoneando.ar/'
        }
      });

      const productos = response.data.products.slice(0, 4); // Tomar los primeros 4 resultados
      if (productos.length === 0) {
        throw new Error(`No se encontraron productos para el ingrediente: ${nombreIngrediente}`);
      }

      const precios = productos.map(producto => producto.unitPrice);
      const precioPromedio = precios.reduce((sum, precio) => sum + precio, 0) / precios.length;
      return precioPromedio;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.error(`Error 429: Límite de solicitudes excedido para el ingrediente ${nombreIngrediente}. Reintentando en ${attempt * 3} segundos...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 3000)); // Espera de forma exponencial
      } else {
        console.error(`Error al obtener el precio del ingrediente ${nombreIngrediente}: ${error.message}`);
        return null;
      }
    }
  }
  return null;
};

const actualizarCostoProductos = async () => {
  try {
    const productosSnapshot = await db.collection('productos').get();

    for (const doc of productosSnapshot.docs) {
      const productoData = doc.data();
      const nombreIngrediente = doc.id.toLowerCase();

        // Saltar si el producto ya tiene un costo estimado
        if (productoData.costoEstimado !== undefined) {
            console.log(`Producto: ${nombreIngrediente} ya tiene un costo estimado. Saltando...`);
            continue;
        }

      let costoEstimado = await obtenerCostoIngrediente(nombreIngrediente);

      if (costoEstimado === null) {
        costoEstimado = 0;
      }

      // Ajustar el costo estimado según la unidad de medida
      if (productoData.unidadMedida !== 'unidades' && costoEstimado !== 0) {
        costoEstimado = costoEstimado / 1000;
      }

      // Limitar el valor a dos decimales
      costoEstimado = parseFloat(costoEstimado.toFixed(2));

      const productoRef = db.collection('productos').doc(doc.id);
      await productoRef.update({ costoEstimado });
      console.log(`Producto: ${nombreIngrediente}, costo estimado por ${productoData.unidadMedida}: ${costoEstimado}`);
      
      await new Promise(resolve => setTimeout(resolve, 200)); // Espera de 1 segundo entre cada solicitud
    }

    console.log('Actualización de costos estimados completada.');
  } catch (error) {
    console.error('Error al actualizar los costos de los productos:', error.message);
  }
};

actualizarCostoProductos();