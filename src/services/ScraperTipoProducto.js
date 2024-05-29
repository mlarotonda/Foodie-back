import puppeteer from "puppeteer";
import admin from "firebase-admin";
import serviceAccount from "../../foodie-1614e-firebase-adminsdk-c4q8s-66a1d5f141.json" assert { type: "json" };

// Inicializar Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const docRef = db.collection("productos").doc("tiposDeProducto");

async function scrapearTipoDeProducto(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  try {
    const items = await page.evaluate(() => {
      const texts = [];
      const filterContents = document.querySelectorAll(
        ".valtech-carrefourar-search-result-0-x-filterContent"
      );
      const lastFilterContent = filterContents[filterContents.length - 1]; // Obtener el último elemento
      if (lastFilterContent) {
        const seeMoreButton = lastFilterContent.querySelector(
          ".valtech-carrefourar-search-result-0-x-seeMoreButton"
        );
        if (seeMoreButton) {
          seeMoreButton.click();
        }
        lastFilterContent
          .querySelectorAll(
            ".valtech-carrefourar-search-result-0-x-filterItem label"
          )
          .forEach((label) => {
            texts.push(label.textContent.trim());
          });
      }
      return texts;
    });

    console.log("-----------Tipos de productos en ", url, ":-----------");
    items.forEach((item) => console.log(item));

    // Leer el documento existente
    const doc = await docRef.get();
    let currentItems = [];
    if (doc.exists) {
      currentItems = doc.data().items || [];
    }

    // Filtrar los nuevos productos que no están en los productos actuales
    const newItems = items.filter((item) => !currentItems.includes(item));

    if (newItems.length > 0) {
      if (doc.exists) {
        await docRef.update({
          items: admin.firestore.FieldValue.arrayUnion(...newItems),
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log("Nuevos productos guardados:", newItems);
      } else {
        await docRef.set({
          items: newItems,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log("Documento creado con nuevos productos:", newItems);
      }
    } else {
      console.log("No hay nuevos productos para guardar.");
    }
  } catch (error) {
    console.error("Error al scrapear en ", url, ":", error);
  } finally {
    await browser.close();
  }
}

const urls = [
  "https://www.carrefour.com.ar/almacen",
  "https://www.carrefour.com.ar/Desayuno-y-merienda",
  "https://www.carrefour.com.ar/Lacteos-y-productos-frescos",
  "https://www.carrefour.com.ar/Carnes-y-Pescados",
  "https://www.carrefour.com.ar/Frutas-y-Verduras",
  "https://www.carrefour.com.ar/Bebidas",
];

urls.forEach(async (url) => {
  await scrapearTipoDeProducto(url);
});
