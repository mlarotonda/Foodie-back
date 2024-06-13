import axios from 'axios';

const apikey = "AIzaSyAS84CqIgescRVP2lv-G1X8k9TwiKJ7Jwo";
const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + apikey;

class GeminiController2 {
  constructor() {}

  getRecipes = async (req, res) => {
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
              { "text": "Devolver las 3 recetas en formato JSON, donde en los ingredientes vengan los campos descripcion, cantidad y unidad y los pasos sea un array de strings" }
            ]
          }
        ]
      };

      const response = await axios.post(url, body, { headers });

      if (response.data) {
        const rawText = response.data.candidates.map(candidate =>
          candidate.content.parts.map(part => part.text).join('')
        ).join('');

        const cleanedText = rawText
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .replace(/\\n/g, '')
          .replace(/\\t/g, '')
          .trim();

        const finalJson = JSON.parse(cleanedText);
        
        for (let recipe of finalJson) {
          const searchTerm = recipe.nombre.replace(' ', '+');
          recipe.imagen = await this.getFirstImageUrl(searchTerm);
        }

        res.status(200).send(finalJson);
      } else {
        res.status(500).send({ success: false, message: 'Formato de respuesta de la API externa inesperado' });
      }

    } catch (error) {
      res.status(500).send({ success: false, message: 'Error al obtener datos de la API externa: ' + error });
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
}

export default new GeminiController2();
