import axios from 'axios';
import admin from "firebase-admin";
import serviceAccount from '../../firebaseServiceAccountKey.json' assert { type: "json" };
import config from '../config/config.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import os from 'os';

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

const fetchWithRetry = async (url, retries = 3, backoff = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url);
    } catch (error) {
      if (error.response && error.response.status === 429 && i < retries - 1) {
        console.log(`Rate limit hit, retrying after ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        backoff *= 2;
      } else {
        throw error;
      }
    }
  }
};

const getImageUrls = async (searchTerm, numImages = 10) => {
  const randomParam = Math.floor(Math.random() * 10000);
  const url = `https://www.googleapis.com/customsearch/v1?key=${apikey}&cx=${cx}&q=${searchTerm}&searchType=image&num=${numImages}&fileType=png&random=${randomParam}`;
  try {
    const response = await fetchWithRetry(url);
    if (response.status !== 200) {
      console.log(`Error al obtener las URLs de las imágenes: ${response.status}`);
      return [];
    }

    const items = response.data.items;
    if (!items || items.length === 0) {
      console.log('No se encontraron imágenes.');
      return [];
    }

    const imageUrls = items.map(item => item.link);
    return imageUrls;
  } catch (error) {
    console.log(`Error al obtener las URLs de las imágenes: ${error}`);
    return [];
  }
};

const downloadImage = async (url, filepath) => {
  const writer = fs.createWriteStream(filepath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

const ensureDirectoryExistence = (dir) => {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }
};

const waitForFile = async (filepath, retries = 5, delay = 500) => {
  for (let i = 0; i < retries; i++) {
    if (fs.existsSync(filepath)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return false;
};

const getDescriptiveImage = async (ingredientName, imageUrls) => {
  const tempDir = path.join(os.tmpdir(), 'images');
  ensureDirectoryExistence(tempDir);

  const imagePaths = [];

  for (const [index, url] of imageUrls.entries()) {
    const imagePath = path.join(tempDir, `image_${index}.png`);
    try {
      await downloadImage(url, imagePath);
      const fileExists = await waitForFile(imagePath);
      if (!fileExists) {
        throw new Error(`File ${imagePath} was not created in time`);
      }
      imagePaths.push(imagePath);
    } catch (error) {
      console.log(`Error al descargar la imagen ${url}: `, error);
      continue;  // Continuar con la siguiente imagen si hay un error
    }
  }

  if (imagePaths.length === 0) {
    return defaultImageUrl;
  }

  const base64Images = imagePaths.map(imagePath => {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      fs.unlinkSync(imagePath); // Eliminar la imagen después de procesarla
      return base64Image;
    } catch (error) {
      console.log(`Error al leer/eliminar la imagen ${imagePath}: `, error);
      return null;
    }
  }).filter(Boolean);  // Filtrar imágenes que no se pudieron leer

  const prompt = `Selecciona la imagen más representativa para el ingrediente "${ingredientName}". Aquí están las imágenes codificadas en base64:\n${base64Images.join('\n')}\nDevuelve SOLAMENTE la imagen más descriptiva en formato base64.`;

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
    const descriptiveImageBase64 = text.trim();
    const descriptiveImageUrl = `data:image/png;base64,${descriptiveImageBase64}`;
    return descriptiveImageUrl;
  } catch (error) {
    console.log(`Error al obtener la imagen descriptiva: ${error}`);
    return defaultImageUrl;
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
      console.log(`Buscando imágenes para: ${searchTerm}`);

      const updatePromise = getImageUrls(searchTerm)
        .then(async imageUrls => {
          if (imageUrls.length > 0) {
            const descriptiveImageUrl = await getDescriptiveImage(ingredientName, imageUrls);
            console.log(`Imagen descriptiva seleccionada para ${ingredientName}: ${descriptiveImageUrl}`);
            return db.collection('productos').doc(ingredientName).set({
              imageUrl: descriptiveImageUrl
            }, { merge: true });
          } else {
            console.log(`No se encontraron imágenes para ${ingredientName}. Asignando imagen por defecto.`);
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
