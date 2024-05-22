
//Es necesario correrlo 2 o 3 veces para que funcione correctamente en los 5 urls

//REVISAR

import puppeteer from 'puppeteer';

async function scrapearTipoDeProducto(url)  {
    // Iniciar el navegador
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    // Navegar a la página
    await page.goto(url, { waitUntil: 'networkidle2' });

    try {
        const items = await page.evaluate(() => {
            const texts = [];
            const filterContents = document.querySelectorAll('.valtech-carrefourar-search-result-0-x-filterContent');
            const lastFilterContent = filterContents[filterContents.length - 1]; // Obtener el último elemento
            if (lastFilterContent) {
                const seeMoreButton = lastFilterContent.querySelector('.valtech-carrefourar-search-result-0-x-seeMoreButton');
                if (seeMoreButton) {
                    seeMoreButton.click();
                }
                lastFilterContent.querySelectorAll('.valtech-carrefourar-search-result-0-x-filterItem label').forEach(label => {
                    texts.push(label.textContent.trim());
                });
            }
            return texts;
        });

        // Imprimir los resultados en la consola
        console.log('-----------Tipos de productos en ',url,':-----------');
        items.forEach(item => console.log(item));

    } catch (error) {
        console.error('Error al scrapear en ',url,':', error);
    } finally {
        // Cerrar el navegador
        await browser.close();
    }
};

const urls = [
    'https://www.carrefour.com.ar/almacen',
    'https://www.carrefour.com.ar/Desayuno-y-merienda',
    'https://www.carrefour.com.ar/Lacteos-y-productos-frescos',
    'https://www.carrefour.com.ar/Carnes-y-Pescados',
    'https://www.carrefour.com.ar/Frutas-y-Verduras'
];

urls.forEach(async (url) => {
    await scrapearTipoDeProducto(url);
});