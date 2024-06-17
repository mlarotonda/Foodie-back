import admin from "firebase-admin";
import serviceAccount from '../../firebaseServiceAccountKey.json' assert { type: "json" };

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
