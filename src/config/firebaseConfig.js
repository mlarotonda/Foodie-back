// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { config } from "./config";

const firebaseConfig = {
  apiKey: config.apiKeyFirebase,
  authDomain: config.authDomain,
  projectId: config.projetctId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
  measurementId: config.measurementId
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
