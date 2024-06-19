import { db } from "../connection/connection.js";
import EanController from "./EanController.js";

const validarProducto = (producto) => {
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
  async agregarProductoPorEAN(req, res) {
    const userId = req.userId;
    const { ean, cantidad } = req.body;

    try {
      validarProducto({ cantidad });

      const ingrediente = await EanController.obtenerTipoProductoPorEAN(ean)

      console.log(`Tipo de producto encontrado: ${ingrediente}`);

      const timestamp = new Date().toISOString();

      const productoRef = db
        .collection("usuarios")
        .doc(String(userId)) // Convert userId to string
        .collection("stock")
        .doc(ingrediente);

      const docSnap = await productoRef.get();  

      if (docSnap.exists) {
        const productoExistente = docSnap.data();
        await productoRef.update({
          cantidad: productoExistente.cantidad + cantidad,
          timestamp,
        });
      } else {
        const ingredienteSnapshot = await db.collection("productos").doc(ingrediente)
        const ingredienteRef = await ingredienteSnapshot.get();
        const unidad = ingredienteRef.data().unidadMedida;
        await productoRef.set({ cantidad, unidad, timestamp });
      }

      console.log(
        `Tipo de producto ${ingrediente} agregado al stock del usuario ${userId}.`
      );
      res
        .status(201)
        .json({ message: `Tipo de producto ${ingrediente} agregado al stock.` });
    } catch (e) {
      console.error("Error al añadir el tipo de producto al stock: ", e.message);
      res.status(400).json({ error: e.message });
    }
  }

  async agregarProductoPorNombre(req, res) {
    const userId = req.userId;
    const { cantidad, nombreProducto } = req.body;

    try {
      validarProducto({ cantidad });

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
          timestamp,
        });
      } else {
        const ingredienteSnapshot = await db.collection("productos").doc(nombreProducto)
        const ingredienteRef = await ingredienteSnapshot.get();
        const unidad = ingredienteRef.data().unidadMedida;
        await productoRef.set({ cantidad, unidad, timestamp });
      }

      console.log(
        `Tipo de producto ${nombreProducto} añadido al stock del usuario ${userId}.`
      );
      res
        .status(201)
        .json({ message: `Tipo de producto ${nombreProducto} añadido al stock.` });
    } catch (e) {
      console.error("Error al añadir el tipo de producto al stock: ", e.message);
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
      const stock = await Promise.all(
        stockSnapshot.docs.map(async (doc) => {
          const productoData = doc.data();
          const productoDoc = await db.collection("productos").doc(doc.id).get();
          const imageUrl = productoDoc.data().imageUrl;
          return {
            id: doc.id,
            ...productoData,
            imageUrl,
          };
        })
      );

      console.log(stock);

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

        // Validar la cantidad
        validarProductoParaConsumo({ cantidad });

        // Verificar que el nombre del producto coincida con un documento en la colección productos
        const productoDoc = await db.collection("productos").doc(nombreProducto).get();
        if (!productoDoc.exists) {
          return res.status(404).json({
            error: `Producto ${nombreProducto} no encontrado en la colección de productos.`,
          });
        }

        // Buscar el producto en el stock del usuario
        const productoRef = db
          .collection("usuarios")
          .doc(String(userId))
          .collection("stock")
          .doc(nombreProducto);

        const docSnap = await productoRef.get();

        if (!docSnap.exists) {
          return res.status(404).json({
            error: `Producto ${nombreProducto} no encontrado en el stock del usuario.`,
          });
        }

        const productoExistente = docSnap.data();

        // Verificar si la cantidad solicitada es menor o igual a la cantidad en stock
        if (cantidad > productoExistente.cantidad) {
          return res.status(400).json({
            error: `Cantidad solicitada de ${nombreProducto} (${cantidad}) es mayor que la cantidad en stock (${productoExistente.cantidad}).`,
          });
        }
      }

      // Si todas las validaciones pasan, realizar la resta de los productos
      for (const ingrediente of ingredientes) {
        const { nombreProducto, cantidad } = ingrediente;

        const productoRef = db
          .collection("usuarios")
          .doc(String(userId))
          .collection("stock")
          .doc(nombreProducto);

        const docSnap = await productoRef.get();
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
