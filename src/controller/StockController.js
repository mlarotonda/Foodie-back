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

const validarProductoParaConsumo = (producto) => {
  if (!Number.isInteger(producto.cantidad) || producto.cantidad <= 0) {
    throw new Error(
      "La cantidad del producto debe ser un número entero positivo."
    );
  }
};

class StockController {
  async añadirProductoPorEAN(req, res) {
    const userId = req.userId;
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
        .doc(String(userId)) // Convert userId to string
        .collection("stock")
        .doc(nombreProducto);

      const docSnap = await productoRef.get();

      if (docSnap.exists) {
        const productoExistente = docSnap.data();
        await productoRef.update({
          cantidad: productoExistente.cantidad + cantidad,
          unidad,
          timestamp,
        });
      } else {
        await productoRef.set({ cantidad, unidad, timestamp });
      }

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

  async añadirProductoPorNombre(req, res) {
    const userId = req.userId;
    const { unidad, cantidad, nombreProducto } = req.body;

    try {
      validarProducto({ unidad, cantidad });

      const timestamp = new Date().toISOString();

      const productoRef = db
        .collection("usuarios")
        .doc(String(userId)) // Convert userId to string
        .collection("stock")
        .doc(nombreProducto);

      const docSnap = await productoRef.get();

      if (docSnap.exists) {
        const productoExistente = docSnap.data();
        await productoRef.update({
          cantidad: productoExistente.cantidad + cantidad,
          unidad,
          timestamp,
        });
      } else {
        await productoRef.set({ cantidad, unidad, timestamp });
      }

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

  async obtenerStock(req, res) {
    const userId = req.userId;

    try {
      const stockSnapshot = await db
        .collection("usuarios")
        .doc(String(userId)) // Convert userId to string
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

  async obtenerProducto(req, res) {
    const userId = req.userId;
    const { nombreProducto } = req.params;

    try {
      const productoRef = db
        .collection("usuarios")
        .doc(String(userId)) // Convert userId to string
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

  async actualizarProducto(req, res) {
    const userId = req.userId;
    const { nombreProducto } = req.params;
    const { unidad, cantidad } = req.body;

    try {
      validarProducto({ unidad, cantidad });

      const productoRef = db
        .collection("usuarios")
        .doc(String(userId)) // Convert userId to string
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
      res.status(200).json({
        message: `Producto ${nombreProducto} actualizado en el stock.`,
      });
    } catch (e) {
      console.error("Error al actualizar el producto en el stock: ", e.message);
      res.status(400).json({ error: e.message });
    }
  }

  async eliminarProducto(req, res) {
    const userId = req.userId;
    const { nombreProducto } = req.params;

    try {
      const productoRef = db
        .collection("usuarios")
        .doc(String(userId)) // Convert userId to string
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

  async consumirProductos(req, res) {
    const userId = req.userId;
    const { ingredientes } = req.body;

    try {
      for (const ingrediente of ingredientes) {
        const { nombreProducto, cantidad } = ingrediente;

        validarProductoParaConsumo({ cantidad });

        const productoRef = db
          .collection("usuarios")
          .doc(String(userId)) // Convert userId to string
          .collection("stock")
          .doc(nombreProducto);

        const docSnap = await productoRef.get();

        if (docSnap.exists) {
          const productoExistente = docSnap.data();
          const nuevaCantidad = productoExistente.cantidad - cantidad;

          if (nuevaCantidad === 0 || nuevaCantidad < 0) {
            await productoRef.delete();
            console.log(
              `Producto ${nombreProducto} eliminado del stock del usuario ${userId}.`
            );
          } else {
            await productoRef.update({
              cantidad: nuevaCantidad,
              timestamp: new Date().toISOString(),
            });
            console.log(
              `Producto ${nombreProducto} actualizado en el stock del usuario ${userId}.`
            );
          }
        } else {
          return res.status(404).json({
            error: `Producto ${nombreProducto} no encontrado en el stock.`,
          });
        }
      }

      console.log(`Productos consumidos del stock del usuario ${userId}.`);
      res.status(200).json({
        message: `Productos consumidos del stock del usuario ${userId}.`,
      });
    } catch (e) {
      console.error("Error al consumir productos del stock: ", e.message);
      res.status(400).json({ error: e.message });
    }
  }
}

export default new StockController();
