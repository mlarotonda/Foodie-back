import fs from "fs";
import puppeteer from "puppeteer";
import admin from "firebase-admin";

// Leer archivo de credenciales de Firebase
const serviceAccountPath = "C:/Users/pesta/OneDrive/Escritorio/foodie-fb.json";
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Inicializar Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://Foodie.firebaseio.com",
});

const db = admin.firestore();
const BASE_URL = "https://www.carrefour.com.ar";
const CATEGORIA = "Bebidas"; // Ajustar según la categoría actual

async function obtenerDetallesDeProducto(page, url) {
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 }); // Aumentado a 120 segundos
    await page.waitForSelector(
      ".vtex-store-components-3-x-specificationsTableContainer",
      { timeout: 20000 }
    );

    const producto = await page.evaluate(() => {
      const tipoProductoElement = document.querySelector(
        'td[data-specification="Tipo de producto"] + td div'
      );
      const eanElement = document.querySelector(
        'td[data-specification="EAN"] + td div'
      );
      const tipoProducto = tipoProductoElement
        ? tipoProductoElement.textContent.trim()
        : null;
      const ean = eanElement ? eanElement.textContent.trim() : null;
      return tipoProducto && ean ? { ean, tipo: tipoProducto } : null;
    });

    console.log(`Detalles del producto extraídos de ${url}:`, producto);
    return producto;
  } catch (error) {
    console.error(`Error al obtener detalles del producto en ${url}:`, error);
    return null;
  }
}

async function obtenerEnlacesDePagina(page) {
  try {
    await page.waitForSelector(".vtex-product-summary-2-x-element", {
      timeout: 20000,
    });
    const enlaces = await page.evaluate(() => {
      const items = [];
      document
        .querySelectorAll("a.vtex-product-summary-2-x-clearLink")
        .forEach((enlace) => {
          const href = enlace.href;
          if (href && !href.includes("#")) {
            items.push(href);
          }
        });
      return items;
    });
    console.log("Enlaces de productos encontrados:", enlaces);
    return enlaces;
  } catch (error) {
    console.error("Error al obtener enlaces de la página:", error);
    return [];
  }
}

async function obtenerUltimaPaginaScrapeada(categoria) {
  try {
    const docRef = db.collection("scraping").doc(categoria);
    const doc = await docRef.get();
    if (doc.exists) {
      const data = doc.data();
      console.log(
        `Última página scrapeada para ${categoria}: ${data.ultimaPagina}`
      );
      return data.ultimaPagina;
    } else {
      console.log(
        `No se encontró registro de última página para ${categoria}. Iniciando desde la página 1.`
      );
      return 0;
    }
  } catch (error) {
    console.error("Error al obtener la última página scrapeada:", error);
    return 0;
  }
}

async function guardarUltimaPaginaScrapeada(categoria, pagina) {
  try {
    const docRef = db.collection("scraping").doc(categoria);
    await docRef.set({ ultimaPagina: pagina });
    console.log(
      `Última página scrapeada para ${categoria} guardada como ${pagina}.`
    );
  } catch (error) {
    console.error("Error al guardar la última página scrapeada:", error);
  }
}

async function obtenerEanDeProductos(url, paginaInicio = 1) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    for (let paginaActual = paginaInicio; paginaActual <= 50; paginaActual++) {
      const paginaUrl = `${url}?page=${paginaActual}`;
      console.log(`Scrapeando la página: ${paginaUrl}`);

      let reintentos = 0;
      let exito = false;

      while (reintentos < 3 && !exito) {
        try {
          await page.goto(paginaUrl, {
            waitUntil: "networkidle2",
            timeout: 120000,
          }); // Aumentado a 120 segundos
          const enlaces = await obtenerEnlacesDePagina(page);

          for (const enlace of enlaces) {
            let intentos = 0;
            let producto = null;

            while (intentos < 3 && !producto) {
              producto = await obtenerDetallesDeProducto(page, enlace);
              if (!producto) {
                const delay = Math.pow(2, intentos) * 1000; // Backoff exponencial
                console.log(
                  `Reintentando ${enlace} (intento ${
                    intentos + 1
                  }) después de ${delay / 1000} segundos`
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                intentos++;
              }
            }

            if (producto) {
              const docRef = db.collection("eans").doc(producto.ean);
              const doc = await docRef.get();

              if (!doc.exists) {
                await docRef.set({
                  tipo: producto.tipo,
                  timestamp: admin.firestore.FieldValue.serverTimestamp(),
                });
                console.log(
                  `EAN ${producto.ean} creado con tipo ${producto.tipo}.`
                );
              } else {
                console.log(`EAN ${producto.ean} ya existe. Saltando...`);
              }
            } else {
              console.log(`Detalles del producto extraídos de ${enlace}: null`);
            }
          }

          await guardarUltimaPaginaScrapeada(CATEGORIA, paginaActual);
          exito = true;
        } catch (error) {
          console.error(
            `Error al scrapear la página ${paginaActual} (intento ${
              reintentos + 1
            }):`,
            error
          );
          reintentos++;
          if (reintentos < 3) {
            console.log(`Reintentando página ${paginaActual} en 5 segundos...`);
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
        }
      }

      if (!exito) {
        console.log(
          `Falló la página ${paginaActual} después de 3 intentos. Continuando con la siguiente...`
        );
      }
    }
  } catch (error) {
    console.error("Error al scrapear en ", url, ":", error);
  } finally {
    await browser.close();
  }
}

async function main() {
  /*const url = `${BASE_URL}/${CATEGORIA}`;
  console.log("Obteniendo la última página scrapeada...");
  const ultimaPagina = await obtenerUltimaPaginaScrapeada(CATEGORIA);
  console.log(`Iniciando scraping desde la página ${ultimaPagina + 1}`);
  await obtenerEanDeProductos(url, ultimaPagina + 1);
  console.log("Scraping completado.");*/

    try {
      const snapshot = await db.collection("eans").get();
      const cantidadDeDocumentos = snapshot.size;
      console.log(
        `Cantidad de documentos en la colección 'eans': ${cantidadDeDocumentos}`
      );
    } catch (error) {
      console.error("Error al contar los documentos: ", error);
    }
}

main().catch(console.error);
