import axios from 'axios';

// DEPRECADO

const token = "ya29.a0AXooCgsdq38DhDIO-cO8P5EweiDJIdxLgMnssRdeoAee4Zk-8JH4nPuWPnLGHl7cljfA-GnsCyoiqN2g-6vB6Bej1duemAa64tY22PR3OVoHq0U5ZSxed9c6ak5w5Y4xKi7DnXzRlArfOzUnqWz0twfHwQwAC22xeqJaJXX03jBu471FtXnoRBCOWH9IukbmNboP5pkkjidwA25ptd95UzOj_TJFIACth0GN3k-9sonlUF4EXMIsujHJNCFq1H5fO2n3qk5RAPJjuGzrahL9PhPy53Oec4lWZcZO7VNj9MBcXY9EwE_kSFjsaAppreF_lZx7D_BcS_q2uGAKRmSlLTnKYnAd9pjJugeAGUEaX948EQX7lt4DBVytElyRUBuW-Id3uhR3ND2mY1SWqLirnZZ5sf511rEaCgYKAVQSARISFQHGX2Mi7nsBUU3jSuun_bzn6qpJvQ0422"
const url = "https://us-central1-aiplatform.googleapis.com/v1/projects/foodie-1614e/locations/us-central1/publishers/google/models/gemini-1.5-flash-001:streamGenerateContent"
const ingredientes = "pollo, zanahoria y cebolla"

class GeminiController {
  constructor() {}

  getRecipes = async (req, res) => {
    try {
      //const { q } = req.query;
      const headers = {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      };

      const body = {
          "contents": [
              {
                  "role": "user",
                  "parts": [
                      {
                          "text": ingredientes
                      }
                  ]
              }
          ],
          "systemInstruction": {
              "parts": [
                  {
                      "text": "- Dar 3 recetas segun los ingredientes dados"
                  },
                  {
                      "text": "- Las recetas deben tener ingredientes y pasos"
                  },
                  //{
                  //    "text": "- Incluir una imagen para cada receta"
                  //},
                  {
                      "text": "- Los ingredientes deben estar expresados en gramos y mililitros"
                  },
                  {
                      "text": "- Las recetas deben venir en formato JSON"
                  }
              ]
          },
          "generationConfig": {
              "maxOutputTokens": 8192,
              "temperature": 0.5,
              "topP": 0.95
          }
      };
      
      const response = await axios.post(url, body, { headers });

      if (response.data) {
        const cleanTexts = response.data.map(item => 
          item.candidates.map(candidate => 
            candidate.content.parts.map(part => part.text).join('')
          ).join('')
        ).join('');

        const finalResponse = cleanTexts
          .replace(/json/g, '')
          .replace(/```/g, '')
          .replace(/\n/g, '')
          .replace(/\\/g, '')
          .trim();

        const finalJson = JSON.parse(finalResponse);

        res.status(200).send(finalJson);
      } else {
        res.status(500).send({ success: false, message: 'Formato de respuesta de la API externa inesperado' });
      }

    } catch (error) {
      res.status(500).send({ success: false, message: 'Error al obtener datos de la API externa' });
    }
  };
}

export default new GeminiController();