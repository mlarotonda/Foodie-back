import { db } from "../connection/firebaseConnection.js";
import RatoneandoController from './RatoneandoController.js';
import GeminiController from './GeminiController.js';

class EanController {
  // Método para obtener el tipo de producto por EAN
  async obtenerTipoProductoPorEAN(req, res) {
    const { ean } = req.params;

    if (!ean) {
        console.log('EAN no proporcionado en la solicitud');
        return res.status(400).json({ error: 'EAN es requerido' });
    }

    let tipoProducto = null;

    try {
        console.log(`Buscando EAN: ${ean} en la colección eans`);

        const eanRef = db.collection("eans").doc(String(ean));
        const eanDoc = await eanRef.get();

        if (eanDoc.exists) {
            tipoProducto = eanDoc.data().tipo;
            console.log(`Producto encontrado: ${ean} con tipo: ${tipoProducto}`);
        } else {
            console.log("EAN no encontrado, llamando a la API de Ratoneando.");

            const nombresProductos = await RatoneandoController.buscarProductoEnAPI(ean);
            tipoProducto = await GeminiController.generarTipoDeProducto(nombresProductos);

            if (!tipoProducto || tipoProducto.trim() === "") {
                throw new Error("El tipo de producto no es válido.");
            }

            /*
            await eanRef.set({
                tipo: tipoProducto,
                timestamp: new Date().toISOString()
            });

            console.log(`Producto con EAN: ${ean} insertado en Firestore con tipo: ${tipoProducto}`);
            */
        }

        res.json({ tipo: tipoProducto });
    } catch (e) {
        console.error("Error al procesar el EAN: ", e.message);
        res.status(400).json({ error: `Error al procesar el EAN: ${e.message}` });
    }
  }
}

export default new EanController();
