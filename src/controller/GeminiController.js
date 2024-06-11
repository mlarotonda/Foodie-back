import axios from 'axios';

const token = "ya29.a0AXooCgtzjKgpJFzbGRierc2rjbFAiYjuWDukYXd0kN2tgKcgNFKQssxBZliCGZ2eNpFfz-elC4jDCuV5lo2u8ywL8MAF63FEv9kbBs9iPMf2pccsVy6rOeqp4B-Vz8vGG36xgBtI_ePetqLMgw48Ye4bGfBPcJAJdxQVndgttC21ixY6N-dq0sAqz6Zem_fZqFGjz4D9tTdWYxMg7S5oo8AST9ILLrYdpUJECY6jKsf11ZGoG6PevA7WQ4JLVeqGS_-ARVMX7dNZpH511QEQ_bI6u0LMIELuM0wgp7UtI7jZP7kz7oxAGDD2jVdA5bcU-spxhliKnLNFyiFQ5Goy8Xrjx-s0NFaYR8gql9LEF8EIQqzYI4vZsMsy1Lf3hBB3vVAGV5BWBHcvsfFwHtgSlZxpk78oWhBeaCgYKAYwSARISFQHGX2Mi17t1t1MdnCLiqqeyMK9AwQ0423"
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