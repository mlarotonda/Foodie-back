import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config/config.js";

export function createModel() {
    const genAI = new GoogleGenerativeAI(config.generativeAIKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

export default createModel;