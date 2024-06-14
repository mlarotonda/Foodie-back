import "dotenv/config";

//Firebase
const apiKeyFirebase = process.env.API_KEY_FIREBASE;
const authDomain = process.env.AUTH_DOMAIN;
const projetctId = process.env.PROJECT_ID;
const storageBucket = process.env.STORAGE_BUCKET;
const messagingSenderId = process.env.MESSAGING_SENDER_ID;
const appId = process.env.APP_ID;
const measurementId = process.env.MEASURENT_ID;

const serverPort = process.env.SERVER_PORT;

//Gemini
const apiKeyGemini = process.env.API_KEY_GEMINI;

//Gemini Scrapper
const aiScrapper = process.env.AI_API_KEY;

const config = {
  apiKeyFirebase,
  authDomain,
  projetctId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId,
  serverPort,
  apiKeyGemini,
  aiScrapper
};

export { config };
