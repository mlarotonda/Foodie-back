import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from "../connection/connection.js";
import axios from 'axios';

const genAI = new GoogleGenerativeAI("AIzaSyC1Jxmxbl2jL_3jelQ0IRZl4kUaIx5LQbw");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

class GeminiController{
  constructor(){}

    generarTipoDeProducto = async (nombresProductos) => {
      const productosSnapshot = await db.collection("productos").get();
      const tiposDeProductos = productosSnapshot.docs.map(doc => doc.id).join(', ');

      const prompt = `Tengo los siguientes productos: ${nombresProductos.join(', ')}. En base a sus nombres, a qué tipo de producto pertenecen? Elegir un único tipo de producto. Las opciones son: ${tiposDeProductos}. Responde SOLO con el tipo de producto correspondiente`;

      try {
        const result = await model.generateContent(prompt);
        const responseText = await result.response;
        const text = await responseText.text();
        const tipoDeProducto = text.trim();
        console.log(`Tipo de producto generado: ${tipoDeProducto}`);
        return tipoDeProducto;
      } catch (error) {
        throw new Error(`Error al generar contenido con el modelo: ${error.message}`);
      }
    }

    getRecipes = async (req, res) => {
      console.log("------request");
  
      const { userId } = req.query;
  
      try {
        const userDoc = await db.collection('usuarios').doc(userId).get();
        if (!userDoc.exists) {
          return res.status(404).send({ success: false, message: 'Usuario no encontrado' });
        }
  
        const userData = userDoc.data();
        console.log("Datos del usuario:", userData);
  
        const stockSnapshot = await db.collection('usuarios').doc(userId).collection('stock').get();
        const stockItems = stockSnapshot.docs.map(doc => ({
          nombre: doc.id,
          cantidad: doc.data().cantidad,
          unidadMedida: doc.data().unidad
        }));
        console.log("Productos en el stock del usuario:", stockItems);
  
        const restrictions = userData.restricciones || [];
        console.log("Restricciones del usuario:", restrictions);
  
        const productosSnapshot = await db.collection('productos').get();
        const productos = productosSnapshot.docs.map(doc => ({ nombre: doc.id, unidadMedida: doc.data().unidadMedida }));
        console.log("Productos en la colección de Firestore:", productos);
  
        const ingredientesPrompt = stockItems.map(item => `${item.nombre}: ${item.cantidad} ${item.unidadMedida}`).join(', ');
        const productosPrompt = productos.map(p => `${p.nombre} medido en ${p.unidadMedida}`).join(', ');
  
        let prompt = `
          Dar 3 recetas de almuerzo/cena que se puedan realizar utilizando SOLO y UNICAMENTE los productos en el stock del usuario. Productos disponibles: ${ingredientesPrompt}.
          El usuario no tiene acceso a otros ingredientes asi que las recetas deben contener unicamente lo que esta en stock.
          Adapta los ingredientes de las recetas para que coincidan con los siguientes nombres y sus respectivas unidades de medida: ${productosPrompt}. No los modifiques en lo mas minimo en ningun momento.
          Las recetas deben estar pensadas para una sola persona, y las porciones pueden ser ajustadas para coincidir con eso.
          Las porciones de los ingredientes deben estar medidas UNICAMENTE en gramos o mililitros, convertir las demás a la que sea más conveniente.
          Devolver las 3 recetas en formato JSON, con los campos {name, ingredients (description, quantity, unit), steps (1,2,3,etc)}.
        `;
  
        if (restrictions.length > 0) {
          prompt += ` Tener en cuenta las restricciones de la persona: ${restriccionesPrompt}.`;
        }
  
        const result = await model.generateContent(prompt);
        const responseText = await result.response;
        const rawText = await responseText.text();
  
        console.log("Raw text received from API:", rawText);
  
        const cleanedText = rawText
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .replace(/\\n/g, '')
          .replace(/\\t/g, '')
          .trim();
  
        console.log("Cleaned text:", cleanedText);
  
        let finalJson;
        try {
          finalJson = JSON.parse(cleanedText);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          return res.status(500).send({ success: false, message: 'Formato de respuesta de la API externa inesperado: ' + error.message });
        }
  
        for (let recipe of finalJson) {
          const searchTerm = recipe.name.replace(' ', '+');
          recipe.imageUrl = await this.getFirstImageUrl(searchTerm);
  
          // Log the ingredients of each recipe
          console.log(`Ingredientes de la receta ${recipe.name}:`, recipe.ingredients);
        }
  
        console.log("--response");
        console.log("Final JSON:", finalJson);
        return res.status(200).send(finalJson);
      } catch (error) {
        console.error('Error fetching data from external API:', error);
        return res.status(500).send({ success: false, message: 'Error al obtener datos de la API externa: ' + error.message });
      }
    };
  
    getFirstImageUrl = async (searchTerm) => {
      const cx = "d4a81011643ae44dd";
      const apikey = "AIzaSyAS84CqIgescRVP2lv-G1X8k9TwiKJ7Jwo";
      const url = `https://www.googleapis.com/customsearch/v1?key=${apikey}&cx=${cx}&q=${searchTerm}&searchType=IMAGE&num=1`;
  
      try {
        const response = await axios.get(url);
        if (response.status !== 200) {
          console.error(`Error al obtener la URL de la imagen: ${response.status}`);
          return null;
        }
  
        const firstImage = response.data.items[0].link;
        return firstImage ? firstImage : null;
      } catch (error) {
        console.error(`Error al obtener la URL de la imagen: ${error}`);
        return null;
      }
    };
}
export default new GeminiController();