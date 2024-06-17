import axios from 'axios';
import admin from "firebase-admin";
import serviceAccount from '../../firebaseServiceAccountKey.json' assert { type: "json" };
import { config } from '../config/config.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const apikey = "AIzaSyAS84CqIgescRVP2lv-G1X8k9TwiKJ7Jwo";
const cx = "92403c1691e7c486c";

// Inicializar Google Generative AI
const genAI = new GoogleGenerativeAI("AIzaSyC1Jxmxbl2jL_3jelQ0IRZl4kUaIx5LQbw");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const defaultImageUrl = "https://e7.pngegg.com/pngimages/577/649/png-clipart-question-mark-question-mark-thumbnail.png";

const traducirIngrediente = async (nombre) => {
  const prompt = `Traducir el siguiente ingrediente al ingles: "${nombre}". Devolver unicamente la traduccion. En el caso de no encontrar traduccion, devolver "no encontre"`;

  try {
    const result = await model.generateContent(prompt);
    if (!result || !result.response) {
      throw new Error('Respuesta inesperada de la API de Generative AI');
    }
    const response = await result.response;
    const text = await response.text();
    if (!text) {
      throw new Error('No se recibió texto de la API de Generative AI');
    }
    const translatedText = text.trim().toLowerCase();
    return translatedText;
  } catch (error) {
    console.log(`Error al traducir el ingrediente: ${error}`);
    return "no encontre";
  }
};

const getFirstImageUrl = async (searchTerm) => {
  const randomParam = Math.floor(Math.random() * 10000);
  const url = `https://www.googleapis.com/customsearch/v1?key=${apikey}&cx=${cx}&q=${searchTerm}&searchType=image&num=1&fileType=png&random=${randomParam}`;
  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      console.log(`Error al obtener la URL de la imagen: ${response.status}`);
      return null;
    }

    const items = response.data.items;
    if (!items || items.length === 0) {
      console.log('No se encontraron imágenes.');
      return null;
    }

    const firstImage = items[0].link;
    return firstImage || null;
  } catch (error) {
    console.log(`Error al obtener la URL de la imagen: ${error}`);
    return null;
  }
};

const generateImagesForIngredients = async () => {
  try {
    const ingredientsSnapshot = await db.collection('productos').get();
    if (ingredientsSnapshot.empty) {
      console.log('No hay ingredientes en la colección.');
      return;
    }

    const updatePromises = [];

    for (const doc of ingredientsSnapshot.docs) {
      const ingredientName = doc.id;
      console.log(`Procesando ingrediente: ${ingredientName}`);
      
      const translatedName = await traducirIngrediente(ingredientName);
      if (translatedName === "no encontre" || !translatedName) {
        console.log(`No se pudo traducir el ingrediente: ${ingredientName}. Asignando imagen por defecto.`);
        await db.collection('productos').doc(ingredientName).set({
          imageUrl: defaultImageUrl
        }, { merge: true });
        continue;
      }

      const searchTerm = translatedName.replace(' ', '+');
      console.log(`Buscando imagen para: ${searchTerm}`);

      const updatePromise = getFirstImageUrl(searchTerm)
        .then(imageUrl => {
          if (imageUrl) {
            console.log(`Imagen encontrada para ${ingredientName}: ${imageUrl}`);
            return db.collection('productos').doc(ingredientName).set({
              imageUrl: imageUrl
            }, { merge: true });
          } else {
            console.log(`No se encontró imagen para ${ingredientName}. Asignando imagen por defecto.`);
            return db.collection('productos').doc(ingredientName).set({
              imageUrl: defaultImageUrl
            }, { merge: true });
          }
        })
        .catch(error => {
          console.log(`Error al actualizar el ingrediente ${ingredientName}: `, error);
          return db.collection('productos').doc(ingredientName).set({
            imageUrl: defaultImageUrl
          }, { merge: true });
        });

      updatePromises.push(updatePromise);
    }

    await Promise.all(updatePromises);
    console.log('Imágenes generadas y actualizadas con éxito.');
  } catch (error) {
    console.log('Error al generar imágenes para los ingredientes: ', error);
  }
};

// Ejecutar el script
generateImagesForIngredients();
