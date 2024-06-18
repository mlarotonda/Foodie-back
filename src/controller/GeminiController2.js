import axios from 'axios';
import { db } from "../connection/connection.js";

const apikey = "AIzaSyAS84CqIgescRVP2lv-G1X8k9TwiKJ7Jwo";
const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + apikey;

class GeminiController2 {
  constructor() {}

  getRecipes = async (req, res) => {
    console.log("------request")

    const { q } = req.query;
    
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      const body = {
        "contents": [
          {
            "parts": [
              { "text": "Dar 3 recetas con estos ingredientes: " + q },
              { "text": "Las recetas deben incluir ingredientes y pasos" },
              { "text": "Los ingredientes deben estar representados en gramos o mililitros" },
              { "text": "Devolver las 3 recetas en formato JSON, donde en los ingredientes vengan los campos description, quantity (string) y unit y los pasos sea un array de strings" },
              { "text": "Los nombres de los campos del JSON deben estar en ingles, pero los valores en español" }
            ]
          }
        ]
      };

      const response = await axios.post(url, body, { headers });

      if (response.data) {
        // const rawText = response.data.candidates.map(candidate =>
        //   candidate.content.parts.map(part => part.text).join('')
        // ).join('');
        
        const rawText = response.data.candidates[0].content.parts[0].text;
        
        const cleanedText = rawText
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .replace(/\\n/g, '')
          .replace(/\\t/g, '')
          .trim();

        var finalJson = null;  
        try {
          finalJson = JSON.parse(cleanedText);
        } catch (error) {
          res.status(500).send({ success: false, message: '1-Formato de respuesta de la API externa inesperado' + error});
        }
        
        for (let recipe of finalJson) {
          const searchTerm = recipe.name.replace(' ', '+');
          recipe.imageUrl = await this.getFirstImageUrl(searchTerm);
        }

        console.log("--response")
        res.status(200).send(finalJson);
      } else {
        res.status(500).send({ success: false, message: '2-Formato de respuesta de la API externa inesperado' + error});
      }

    } catch (error) {
      res.status(500).send({ success: false, message: '3-Error al obtener datos de la API externa: ' + error });
    }
  };

  getFirstImageUrl = async (searchTerm) => {  
    const cx = "d4a81011643ae44dd"
    const url = `https://www.googleapis.com/customsearch/v1?key=${apikey}&cx=${cx}&q=${searchTerm}&searchType=IMAGE&num=1`;

    try {
      const response = await axios.get(url);
      if (response.status !== 200) {
        console.log(`Error al obtener la URL de la imagen: ${response.status}`);
        return null;
      }

      const firstImage = response.data.items[0].link;
      
      return firstImage ? firstImage : null;

    } catch (error) {
      console.log(`Error al obtener la URL de la imagen: ${error}`);
      return null;
    }
  };

  // Función para generar contenido con el modelo
  async generarTipoDeProducto(nombresProductos) {
    const productosSnapshot = await db.collection("productos").get();
    const tiposDeProductos = productosSnapshot.docs.map(doc => doc.id).join(', ');

    const prompt = `Tengo los siguientes productos: ${nombresProductos.join(', ')}. En base a sus nombres, a qué tipo de producto pertenecen? Elegir un unico tipo de producto. Las opciones son: ${tiposDeProductos}. Responde SOLO con el tipo de producto correspondiente`;

    try {
      const result = await axios.post(url, { prompt });
      const responseText = await result.data.candidates[0].content;
      console.log(`Tipo de producto generado: ${responseText.trim()}`);
      return responseText.trim();
    } catch (error) {
      throw new Error(`Error al generar contenido con el modelo: ${error.message}`);
    }
  }
}

export default new GeminiController2();
export { generarTipoDeProducto };
