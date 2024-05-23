import {Usuario} from "../models/usuario.js"
import {Receta} from "../models/receta.js"

class UserController {
  // Método para crear un nuevo usuario
  async crearUsuario(req, res) {
    try {
      const nuevoUsuario = await Usuario.create(req.body);
      res.status(201).json(nuevoUsuario);
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      res.status(500).json({ error: "Error al crear el usuario" });
    }
  }

  // Método para eliminar un usuario por su ID
  async eliminarUsuario(req, res) {
    const { userId } = req.params;
    try {
      const usuarioEliminado = await Usuario.destroy({ where: { userId } });
      if (usuarioEliminado) {
        res.status(200).json({ message: "Usuario eliminado correctamente" });
      } else {
        res.status(404).json({ error: "Usuario no encontrado" });
      }
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      res.status(500).json({ error: "Error al eliminar el usuario" });
    }
  }

  // Método para actualizar los datos de un usuario por su ID
  async actualizarUsuario(req, res) {
    const { userId } = req.params;
    try {
      const [numFilasActualizadas, usuarioActualizado] = await Usuario.update(
        req.body,
        {
          where: { userId },
          returning: true, // Devolver el registro actualizado
        }
      );
      if (numFilasActualizadas) {
        res.status(200).json(usuarioActualizado[0]);
      } else {
        res.status(404).json({ error: "Usuario no encontrado" });
      }
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      res.status(500).json({ error: "Error al actualizar el usuario" });
    }
  }
  async crearReceta(req, res) {
    try {
      const { titulo, descripcion, instrucciones, puntuacion } = req.body;

      if (!titulo || !descripcion || !instrucciones) {
        return res
          .status(400)
          .json({ error: "Todos los campos son obligatorios" });
      }
      const nuevaReceta = await Receta.create({
        titulo,
        descripcion,
        instrucciones,
        puntuacion,
      });
      res.status(201).json({ receta: nuevaReceta });
    } catch (error) {
      console.error("Error al crear la receta:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}

export default new UserController();
