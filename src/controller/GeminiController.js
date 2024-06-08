import axios from 'axios';

const token = "ya29.a0AXooCgs9L-ujO3Lm852UVlaKwVNWOR4aHgkULO9WrcSIaL4plIk33AWTxyOlchfHq8gCLZergeS-sJ-henqVW6vOfYIBy6wWJ1o59iZW6vAofYX4tJFxO7Z-MfitUVtCw9jXX38MkRKJerJN4BFG_ab7DoBk52cmLSuOqlpgg875ZXeqSydAJ8-iZE0_ByMga0jg2J7ogDhsSq88kCZcbRPWWiY9vP9Rm5mfzd8b93I9i_QU8RSkCl7KhI2wmgmPd8HQharLFhYJc0J8GiUepWQ8hmwNjtg9s5OPufIEPDoFwiLnBFXnpL3qk7iMRF1vm8RsqmMmWlgYzctqCxUt0NyWSefZgONzk6mubGxZxfzaE2DwrZmbVqBDM4rndrg1mQyKd1vhEhlkNZZlRm_BAAlCQN04-CsqaCgYKAQMSARISFQHGX2MiM_fnJeC5IA5u70SAKxkIUg0423"
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