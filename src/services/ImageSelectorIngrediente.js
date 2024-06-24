import axios from 'axios';
import admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import serviceAccount from '../../firebaseServiceAccountKey.json' assert { type: 'json' };
import config from "../config/config.js";

// Inicializar Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://foodie-1614e.appspot.com" // Reemplaza con la URL de tu bucket de Firestore
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const apikey = config.googleAPI;
const cx = config.buscador;

//const model = await createModel();
const genAI = new GoogleGenerativeAI(config.generativeAIKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const defaultImageUrl = "https://www.svgrepo.com/show/146075/question.svg";

const fetchWithRetry = async (fetchFunction, retries = 5, backoff = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchFunction();
    } catch (error) {
      if ((error.response && (error.response.status === 429 || error.response.status === 500)) && i < retries - 1) {
        console.log(`Error ${error.response.status}, retrying after ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        backoff *= 2;
      } else {
        console.log(`Error: ${error.message}`);
        throw error;
      }
    }
  }
};

const traducirIngrediente = async (nombre) => {
  const prompt = `Traducir el siguiente ingrediente al ingles: "${nombre}". Devolver unicamente la traduccion. En caso de dudar con alguna traduccion, tene en cuenta que es en un contexto de comida. En el caso de no encontrar traduccion, devolver "no encontre"`;

  console.log(`Traduciendo ingrediente: ${nombre}`);

  try {
    const result = await fetchWithRetry(() => model.generateContent(prompt));
    const response = await result.response;
    const text = await response.text();
    const translatedText = text.trim().toLowerCase();
    console.log(`Traducción de ${nombre}: ${translatedText}`);
    return translatedText || "no encontre";
  } catch (error) {
    console.log(`Error al traducir el ingrediente ${nombre}: ${error}`);
    return "no encontre";
  }
};

const getImageUrls = async (searchTerm, numImages = 5) => {
  const randomParam = Math.floor(Math.random() * 10000);
  const url = `https://www.googleapis.com/customsearch/v1?key=${apikey}&cx=${cx}&q=${searchTerm}&searchType=image&num=${numImages}&fileType=svg&random=${randomParam}`;
  
  console.log(`Obteniendo URLs de imágenes para: ${searchTerm}`);

  try {
    const response = await fetchWithRetry(() => axios.get(url));
    const items = response.data.items || [];
    const svgImageUrls = items.map(item => item.link).filter(link => link.endsWith('.svg'));
    console.log(`URLs de imágenes obtenidas para ${searchTerm}: ${svgImageUrls}`);
    return svgImageUrls;
  } catch (error) {
    console.log(`Error al obtener las URLs de las imágenes para ${searchTerm}: ${error}`);
    return [];
  }
};

const downloadImageToStorage = async (url, fileName) => {
  console.log(`Descargando imagen: ${url}`);
  
  try {
    const response = await fetchWithRetry(() => axios.get(url, { responseType: 'arraybuffer' }));
    const file = bucket.file(fileName);
    await file.save(response.data, {
      metadata: { contentType: 'image/svg+xml' }
    });
    const [publicUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491' // Ajusta la fecha de expiración si es necesario
    });
    console.log(`Imagen descargada y guardada en el storage: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.log(`Error al descargar la imagen ${url}: ${error}`);
    return null;
  }
};

const clearImageDirectory = async () => {
  try {
    console.log('Eliminando directorio de imágenes');
    const [files] = await bucket.getFiles({ prefix: 'images/' });
    await Promise.all(files.map(file => file.delete()));
    console.log('Directorio de imágenes eliminado');
  } catch (error) {
    console.log(`Error al eliminar el directorio de imágenes: ${error}`);
  }
};

const processIngredient = async (ingredientName) => {
  console.log(`\nProcesando ingrediente: ${ingredientName}`);

  const translatedName = await traducirIngrediente(ingredientName);
  if (translatedName === "no encontre") {
    console.log(`No se pudo traducir el ingrediente: ${ingredientName}. Asignando imagen por defecto.`);
    await db.collection('productos').doc(ingredientName).set({ imageUrl: defaultImageUrl }, { merge: true });
    return;
  }

  const searchTerm = translatedName.replace(' ', '+');
  console.log(`Buscando imágenes para: ${searchTerm}`);

  const imageUrls = await getImageUrls(searchTerm);
  const descriptiveImageUrl = imageUrls.length > 0 ? await downloadImageToStorage(imageUrls[0], `images/${ingredientName}.svg`) : defaultImageUrl;
  console.log(`Imagen descriptiva seleccionada para ${ingredientName}: ${descriptiveImageUrl}`);
  try {
    await db.collection('productos').doc(ingredientName).set({ imageUrl: descriptiveImageUrl }, { merge: true });
  } catch (error) {
    console.log(`Error al actualizar la imagen del ingrediente ${ingredientName}, asignando imagen por defecto: ${error.message}`);
    await db.collection('productos').doc(ingredientName).set({ imageUrl: defaultImageUrl }, { merge: true });
  }
};

const generateImagesForIngredients = async () => {
  try {
    await clearImageDirectory();

    const ingredientsSnapshot = await db.collection('productos').get();
    if (ingredientsSnapshot.empty) {
      console.log('No hay ingredientes en la colección.');
      return;
    }

    for (const doc of ingredientsSnapshot.docs) {
      const ingredientName = doc.id;
      await processIngredient(ingredientName);
    }

    console.log('Imágenes generadas y actualizadas con éxito.');
  } catch (error) {
    console.log('Error al generar imágenes para los ingredientes: ', error);
  }
};

// Ejecutar el script
generateImagesForIngredients();
