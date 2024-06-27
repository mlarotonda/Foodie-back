import admin from "firebase-admin";
import serviceAccount from '../../firebaseServiceAccountKey.json' assert { type: "json" };
import config from "../config/config.js";

serviceAccount.private_key_id = config.firestorePrivateKeyId;
serviceAccount.private_key = config.firestorePrivateKey.replace(/\\n/g, '\n'); // Reemplaza \n por saltos de línea reales

async function initializeFirebase() {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), 
    databaseURL: "https://Foodie.firebaseio.com",
  });

  const db = admin.firestore();
  return { db, admin };
}

const firebaseServices = await initializeFirebase();
const db = firebaseServices.db;
const firebaseAdmin = firebaseServices.admin;

export { db, firebaseAdmin as admin };
