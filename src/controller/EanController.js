import { db } from "../connection/connection.js";
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const api = "AIzaSyC1Jxmxbl2jL_3jelQ0IRZl4kUaIx5LQbw"
const genAI = new GoogleGenerativeAI(api);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


  // Función para buscar producto en la API de Ratoneando
 async function buscarProductoEnAPI(ean) {
    try {
      console.log(`Buscando producto en API Ratoneando con EAN: ${ean}`);
      const response = await axios.get(`https://api.ratoneando.ar/?q=${ean}`, {
        headers: {
          'Referer': 'https://ratoneando.ar/'
        }
      });

      const productos = response.data.products.slice(0, 15);
      if (productos.length === 0) {
        throw new Error("No se encontraron productos en la API de Ratoneando.");
      }

      console.log(`Productos encontrados en API Ratoneando: ${productos.map(producto => producto.name).join(', ')}`);
      return productos.map(producto => producto.name);
    } catch (error) {
      throw new Error(`Error al llamar a la API de Ratoneando: ${error.message}`);
    }
  }

  // Función para generar contenido con el modelo
  async function generarTipoDeProducto(nombresProductos) {
    const productosSnapshot = await db.collection("productos").get();
    const tiposDeProductos = productosSnapshot.docs.map(doc => doc.id).join(', ');

    const prompt = `Tengo los siguientes productos: ${nombresProductos.join(', ')}. En base a sus nombres, a qué tipo de producto pertenecen? Elegir un unico tipo de producto. Las opciones son: ${tiposDeProductos}. Responde SOLO con el tipo de producto correspondiente`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = await result.response.text();
      console.log(`Tipo de producto generado: ${responseText.trim()}`);
      return responseText.trim();
    } catch (error) {
      throw new Error(`Error al generar contenido con el modelo: ${error.message}`);
    }
  }
  class EanController {
  // Método para obtener el tipo de producto por EAN
  async obtenerTipoProductoPorEAN(req, res) {
    const { ean } = req.params;

    if (!ean) {
        console.log('EAN no proporcionado en la solicitud');
        return res.status(400).json({ error: 'EAN es requerido' });
    }

    let tipoProducto = null;

    try {
        console.log(`Buscando EAN: ${ean} en la colección eans`);

        const eanRef = db.collection("eans").doc(String(ean));
        const eanDoc = await eanRef.get();

        if (eanDoc.exists) {
            tipoProducto = eanDoc.data().tipo;
            console.log(`Producto encontrado: ${ean} con tipo: ${tipoProducto}`);
        } else {
            console.log("EAN no encontrado, llamando a la API de Ratoneando.");

            const nombresProductos = await buscarProductoEnAPI(ean);
            tipoProducto = await generarTipoDeProducto(nombresProductos);

            if (!tipoProducto || tipoProducto.trim() === "") {
                throw new Error("El tipo de producto no es válido.");
            }

            await eanRef.set({
                tipo: tipoProducto,
                timestamp: new Date().toISOString()
            });

            console.log(`Producto con EAN: ${ean} insertado en Firestore con tipo: ${tipoProducto}`);
        }

        res.json({ tipo: tipoProducto });
    } catch (e) {
        console.error("Error al procesar el EAN: ", e.message);
        res.status(400).json({ error: `Error al procesar el EAN: ${e.message}` });
    }
}

}

export default new EanController();
