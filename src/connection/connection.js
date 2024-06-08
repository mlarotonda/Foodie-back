import admin from "firebase-admin";
import { pathToFileURL } from "url";

// Convierte la ruta del archivo de credenciales a una URL válida
const serviceAccountPath = pathToFileURL(
  "C:/Users/pesta/OneDrive/Escritorio/foodie-fb.json"
).href;

async function initializeFirebase() {
  const serviceAccount = await import(serviceAccountPath, {
    assert: { type: "json" },
  });

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount.default), 
    databaseURL: "https://Foodie.firebaseio.com",
  });

  const db = admin.firestore();
  return { db, admin };
}

const firebaseServices = await initializeFirebase();
const db = firebaseServices.db;
const firebaseAdmin = firebaseServices.admin;

export { db, firebaseAdmin as admin };
