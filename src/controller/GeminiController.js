import {model} from "../connection/GeminiApiConnection.js"

async function run(prompt) {
  
    console.log(model.apiKey);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
  }
  const prompt = "Dame tres recetas que tengan pollo,papa y cebolla de elgourmet.com"
  
  run(prompt);


/*import {genAI} from "../connection/GeminiApiConnection.js"

  async function run() {
    // For text-only input, use the gemini-pro model
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
  
    const prompt = "Write a story about a magic backpack."
  
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
  }
  
  run();
  */