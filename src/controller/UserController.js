import { db } from "../connection/connection.js";
import bcrypt from "bcrypt";

const saltRounds = 10;

// Función para obtener y actualizar el contador de ID
const obtenerYActualizarContadorID = async (tipo) => {
  const contadorRef = db.collection("contadores").doc(tipo);
  const contadorDoc = await contadorRef.get();

  let nuevoId;

  if (contadorDoc.exists) {
    nuevoId = contadorDoc.data().valor + 1;
    await contadorRef.update({ valor: nuevoId });
  } else {
    nuevoId = 1;
    await contadorRef.set({ valor: nuevoId });
  }

  return nuevoId;
};

const validarUsuario = (usuario) => {
  if (typeof usuario.mail !== "string" || usuario.mail.trim() === "") {
    throw new Error(
      "El correo electrónico es obligatorio y debe ser una cadena no vacía."
    );
  }
  if (typeof usuario.password !== "string" || usuario.password.trim() === "") {
    throw new Error(
      "La contraseña es obligatoria y debe ser una cadena no vacía."
    );
  }
};

const validarPersona = (persona) => {
  if (typeof persona.nombre !== "string" || persona.nombre.trim() === "") {
    throw new Error("El nombre es obligatorio y debe ser una cadena no vacía.");
  }
  if (typeof persona.apellido !== "string" || persona.apellido.trim() === "") {
    throw new Error(
      "El apellido es obligatorio y debe ser una cadena no vacía."
    );
  }
  if (!Number.isInteger(persona.edad) || persona.edad <= 0) {
    throw new Error("La edad debe ser un número entero positivo.");
  }
};

class UserController {
  // Crear un nuevo usuario
  async crearUsuario(req, res) {
    const { mail, password, persona } = req.body;

    try {
      validarUsuario({ mail, password });
      validarPersona(persona);

      // Obtener el nuevo ID incremental para el usuario
      const userId = await obtenerYActualizarContadorID("usuarioId");

      // Obtener el nuevo ID incremental para la persona
      const personaId = await obtenerYActualizarContadorID("personaId");

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Inicializar datos del usuario
      const nuevoUsuario = {
        userId,
        mail,
        password: hashedPassword,
        persona: {
          ...persona,
          personaId,
        },
      };

      // Guardar usuario en Firestore
      const userRef = db.collection("usuarios").doc(String(userId));
      await userRef.set(nuevoUsuario);

      // Guardar persona en la colección personas
      const personaRef = db.collection("personas").doc(String(personaId));
      await personaRef.set({ ...persona, personaId });

      // Crear subcolecciones vacías
      await userRef.collection("grupoFamiliar").add({});
      await userRef.collection("recetas").add({});
      await userRef.collection("stock").add({});

      console.log("Usuario creado con ID: ", userId);
      res.status(201).json({ id: userId, ...nuevoUsuario });
    } catch (e) {
      console.error("Error al crear el usuario: ", e.message);
      res.status(400).json({ error: e.message });
    }
  }

  // Obtener un usuario por ID
  async obtenerUsuario(req, res) {
    const { id } = req.params;

    try {
      const userRef = db.collection("usuarios").doc(id);
      const docSnap = await userRef.get();

      if (docSnap.exists) {
        const grupoFamiliarSnap = await userRef
          .collection("grupoFamiliar")
          .get();
        const recetasSnap = await userRef.collection("recetas").get();
        const stockSnap = await userRef.collection("stock").get();

        const grupoFamiliar = grupoFamiliarSnap.docs.map((doc) => doc.data());
        const recetas = recetasSnap.docs.map((doc) => doc.data());
        const stock = stockSnap.docs.map((doc) => doc.data());

        res
          .status(200)
          .json({ ...docSnap.data(), grupoFamiliar, recetas, stock });
      } else {
        console.log("No se encontró el documento!");
        res.status(404).json({ error: "Usuario no encontrado" });
      }
    } catch (e) {
      console.error("Error al obtener el usuario: ", e.message);
      res.status(500).json({ error: e.message });
    }
  }

  // Obtener todos los usuarios
  async obtenerUsuarios(req, res) {
    try {
      const querySnapshot = await db.collection("usuarios").get();
      const usuarios = [];
      for (const doc of querySnapshot.docs) {
        const userData = doc.data();
        const userRef = db.collection("usuarios").doc(doc.id);

        const grupoFamiliarSnap = await userRef
          .collection("grupoFamiliar")
          .get();
        const recetasSnap = await userRef.collection("recetas").get();
        const stockSnap = await userRef.collection("stock").get();

        const grupoFamiliar = grupoFamiliarSnap.docs.map((doc) => doc.data());
        const recetas = recetasSnap.docs.map((doc) => doc.data());
        const stock = stockSnap.docs.map((doc) => doc.data());

        usuarios.push({ ...userData, grupoFamiliar, recetas, stock });
      }
      res.status(200).json(usuarios);
    } catch (e) {
      console.error("Error al obtener los usuarios: ", e.message);
      res.status(500).json({ error: e.message });
    }
  }

  // Actualizar un usuario
  async actualizarUsuario(req, res) {
    const { id } = req.params;
    const { mail, password, persona } = req.body;

    try {
      if (mail || password) {
        validarUsuario({ mail, password });
      }
      if (persona) {
        validarPersona(persona);
      }

      const userRef = db.collection("usuarios").doc(id);
      const docSnap = await userRef.get();

      if (!docSnap.exists) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const updatedData = {};
      if (mail) updatedData.mail = mail;
      if (password)
        updatedData.password = await bcrypt.hash(password, saltRounds);
      if (persona) updatedData.persona = persona;

      await userRef.update(updatedData);
      console.log("Usuario actualizado con éxito");
      res.status(200).json({ id, ...updatedData });
    } catch (e) {
      console.error("Error al actualizar el usuario: ", e.message);
      res.status(400).json({ error: e.message });
    }
  }

  // Eliminar un usuario
  async eliminarUsuario(req, res) {
    const { id } = req.params;

    try {
      const userRef = db.collection("usuarios").doc(id);
      await userRef
        .collection("grupoFamiliar")
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => doc.ref.delete());
        });
      await userRef
        .collection("recetas")
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => doc.ref.delete());
        });
      await userRef
        .collection("stock")
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => doc.ref.delete());
        });
      await userRef.delete();

      console.log("Usuario eliminado con éxito");
      res.status(200).json({ message: "Usuario eliminado con éxito" });
    } catch (e) {
      console.error("Error al eliminar el usuario: ", e.message);
      res.status(500).json({ error: e.message });
    }
  }
}

export default new UserController();
