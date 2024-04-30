import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/config.js";

//const API = AIzaSyCuJcszY1WBAsG87Mdk0VB0rxeiKF9Q9lU;

const genAI = new GoogleGenerativeAI(config.apiKeyGemini);

const model = genAI.getGenerativeModel({ model: "gemini-pro"});

export {model, genAI}