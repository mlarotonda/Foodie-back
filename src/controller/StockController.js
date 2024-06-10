import { db } from "../connection/connection.js";

const validarProducto = (producto) => {
  if (typeof producto.unidad !== "string" || producto.unidad.trim() === "") {
    throw new Error(
      "La unidad del producto es obligatoria y debe ser una cadena no vacía."
    );
  }
  if (!Number.isInteger(producto.cantidad) || producto.cantidad <= 0) {
    throw new Error(
      "La cantidad del producto debe ser un número entero positivo."
    );
  }
};

class StockController {
  // Añadir un producto al stock del usuario usando el EAN
  async añadirProductoPorEAN(req, res) {
    const { userId } = req.params;
    const { ean, unidad, cantidad } = req.body;

    try {
      validarProducto({ unidad, cantidad });

      console.log(`Buscando producto con EAN: ${ean}`);

      const productosRef = db.collection("productos");
      const productoSnapshot = await productosRef
        .where("ean", "array-contains", ean)
        .get();

      if (productoSnapshot.empty) {
        console.log("Producto no encontrado con el EAN proporcionado.");
        return res
          .status(404)
          .json({ error: "Producto no encontrado con el EAN proporcionado." });
      }

      const productoDoc = productoSnapshot.docs[0];
      const nombreProducto = productoDoc.id;

      console.log(`Producto encontrado: ${nombreProducto}`);

      const timestamp = new Date().toISOString();

      const productoRef = db
        .collection("usuarios")
        .doc(userId)
        .collection("stock")
        .doc(nombreProducto);
      await productoRef.set({ cantidad, unidad, timestamp });

      console.log(
        `Producto ${nombreProducto} añadido al stock del usuario ${userId}.`
      );
      res
        .status(201)
        .json({ message: `Producto ${nombreProducto} añadido al stock.` });
    } catch (e) {
      console.error("Error al añadir el producto al stock: ", e.message);
      res.status(400).json({ error: e.message });
    }
  }

  // Añadir un producto al stock del usuario usando el nombre del producto
  async añadirProductoPorNombre(req, res) {
    const { userId, nombreProducto } = req.params;
    const { unidad, cantidad } = req.body;

    try {
      validarProducto({ nombre: nombreProducto, unidad, cantidad });

      const timestamp = new Date().toISOString();

      const productoRef = db
        .collection("usuarios")
        .doc(userId)
        .collection("stock")
        .doc(nombreProducto);
      await productoRef.set({ cantidad, unidad, timestamp });

      console.log(
        `Producto ${nombreProducto} añadido al stock del usuario ${userId}.`
      );
      res
        .status(201)
        .json({ message: `Producto ${nombreProducto} añadido al stock.` });
    } catch (e) {
      console.error("Error al añadir el producto al stock: ", e.message);
      res.status(400).json({ error: e.message });
    }
  }

  // Obtener el stock del usuario
  async obtenerStock(req, res) {
    const { userId } = req.params;

    try {
      const stockSnapshot = await db
        .collection("usuarios")
        .doc(userId)
        .collection("stock")
        .get();
      const stock = stockSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json(stock);
    } catch (e) {
      console.error("Error al obtener el stock: ", e.message);
      res.status(500).json({ error: e.message });
    }
  }

  // Obtener un producto específico del stock del usuario
  async obtenerProducto(req, res) {
    const { userId, nombreProducto } = req.params;

    try {
      const productoRef = db
        .collection("usuarios")
        .doc(userId)
        .collection("stock")
        .doc(nombreProducto);
      const docSnap = await productoRef.get();

      if (docSnap.exists) {
        res.status(200).json(docSnap.data());
      } else {
        res.status(404).json({ error: "Producto no encontrado en el stock." });
      }
    } catch (e) {
      console.error("Error al obtener el producto del stock: ", e.message);
      res.status(500).json({ error: e.message });
    }
  }

  // Actualizar un producto en el stock del usuario
  async actualizarProducto(req, res) {
    const { userId, nombreProducto } = req.params;
    const { unidad, cantidad } = req.body;

    try {
      validarProducto({ nombre: nombreProducto, unidad, cantidad });

      const productoRef = db
        .collection("usuarios")
        .doc(userId)
        .collection("stock")
        .doc(nombreProducto);
      await productoRef.update({
        cantidad,
        unidad,
        timestamp: new Date().toISOString(),
      });

      console.log(
        `Producto ${nombreProducto} actualizado en el stock del usuario ${userId}.`
      );
      res
        .status(200)
        .json({
          message: `Producto ${nombreProducto} actualizado en el stock.`,
        });
    } catch (e) {
      console.error("Error al actualizar el producto en el stock: ", e.message);
      res.status(400).json({ error: e.message });
    }
  }

  // Eliminar un producto del stock del usuario
  async eliminarProducto(req, res) {
    const { userId, nombreProducto } = req.params;

    try {
      const productoRef = db
        .collection("usuarios")
        .doc(userId)
        .collection("stock")
        .doc(nombreProducto);
      await productoRef.delete();

      console.log(
        `Producto ${nombreProducto} eliminado del stock del usuario ${userId}.`
      );
      res
        .status(200)
        .json({ message: `Producto ${nombreProducto} eliminado del stock.` });
    } catch (e) {
      console.error("Error al eliminar el producto del stock: ", e.message);
      res.status(500).json({ error: e.message });
    }
  }
}

export default new StockController();
