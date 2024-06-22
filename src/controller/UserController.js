import { db } from "../connection/firebaseConnection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import PersonaController from "./PersonaController.js";

const saltRounds = 10;

const validarUsuario = async (usuario) => {  
  await validarEmail(usuario.mail);
  await validarPassword(usuario.password);
};

const validarEmail = async (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    throw new Error("El correo electrónico no es válido.");
  }
  if (typeof email !== "string" || email.trim() === "") {
    throw new Error(
      "El correo electrónico es obligatorio y debe ser una cadena no vacía."
    );
  }
  // Validar si el correo ya está en uso
  const userRef = db.collection("usuarios").doc(email);
  const docSnap = await userRef.get();
  if (docSnap.exists) {
    throw new Error(
      "El correo electrónico ya está en uso."
    );
  };
}

const validarPassword = (password) => {
  if (typeof password !== "string" || password.trim() === "") {
    throw new Error(
      "La contraseña es obligatoria y debe ser una cadena no vacía."
    );
  }
}

class UserController {
  async crearUsuario(req, res) {
    const {
      mail,
      password,
      nombre,
      apellido,
      edad,
      restricciones = [],
    } = req.body;

    try {
      await validarUsuario({ mail, password });
      const personaUser = { nombre, apellido, edad, restricciones };
      
      console.log(personaUser);

      const persona = await PersonaController.crearPersona(personaUser);

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Inicializar datos del usuario
      const nuevoUsuario = {
        mail,
        password: hashedPassword,
        persona
      };

      console.log(nuevoUsuario);

      const userRef = db.collection("usuarios").doc(mail);

      // Guardar usuario en Firestore con mail como ID
      await userRef.set(nuevoUsuario);

      const docRef = db.collection("personas").doc(persona.personaId);
      await docRef.set(persona);

      console.log("Usuario creado con ID: ", mail);
      res.status(201).json({ id: mail, ...nuevoUsuario });
    } catch (e) {
      console.error("Error al crear el usuario: ", e.message);
      res.status(400).json({ error: e.message });
    }
  }

  // Autenticar usuario y generar token
  async autenticarUsuario(req, res) {
    const { mail, password } = req.body;

    try {
      const userRef = db.collection("usuarios").doc(mail);
      const docSnap = await userRef.get();

      if (!docSnap.exists) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }

      const user = docSnap.data();
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Contraseña incorrecta." });
      }

      // Crear un token con el ID del usuario y una fecha de expiración
      const token = jwt.sign({ id: user.mail }, config.secretKey, {
        expiresIn: "3h", // El token expira en 3 horas
      });

      res.status(200).json({ auth: true, token });
    } catch (e) {
      console.error("Error al autenticar el usuario: ", e.message);
      res.status(500).json({ error: e.message });
    }
  }

  // Obtener un usuario por ID
  async obtenerUsuario(req, res) {
    const userId = req.user.id;
    console.log(userId);
    try {
      const userRef = db.collection("usuarios").doc(userId);
      const docSnap = await userRef.get();

      if (docSnap.exists) {
        const comensalesSnap = await userRef.collection("comensales").get();
        const recetasSnap = await userRef.collection("recetas").get();
        const stockSnap = await userRef.collection("stock").get();

        const comensales = comensalesSnap.docs.map((doc) => doc.data());
        const recetas = recetasSnap.docs.map((doc) => doc.data());
        const stock = stockSnap.docs.map((doc) => doc.data());

        res
          .status(200)
          .json({ ...docSnap.data(), comensales, recetas, stock });
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

        const comensalesSnap = await userRef.collection("comensales").get();
        const recetasSnap = await userRef.collection("recetas").get();
        const stockSnap = await userRef.collection("stock").get();

        const comensales = comensalesSnap.docs.map((doc) => doc.data());
        const recetas = recetasSnap.docs.map((doc) => doc.data());
        const stock = stockSnap.docs.map((doc) => doc.data());

        usuarios.push({ ...userData, comensales, recetas, stock });
      }
      res.status(200).json(usuarios);
    } catch (e) {
      console.error("Error al obtener los usuarios: ", e.message);
      res.status(500).json({ error: e.message });
    }
  }

  // Autenticar usuario y generar token
  async login(req, res) {
    const { mail, password } = req.body;

    try {
      const userRef = db.collection("usuarios").doc(mail);
      const docSnap = await userRef.get();

      if (!docSnap.exists) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }

      const user = docSnap.data();
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Contraseña incorrecta." });
      }

      // Crear un token con el ID del usuario y una fecha de expiración
      const token = jwt.sign({ id: user.mail }, config.secretKey, {
        expiresIn: "1h", // El token expira en 1 hora
      });

      res.status(200).json({ auth: true, token });
    } catch (e) {
      console.error("Error al autenticar el usuario: ", e.message);
      res.status(500).json({ error: e.message });
    }
  }

  // Actualizar un usuario
  async actualizarUsuario(req, res) {

    const userId  = req.userId;
    const { mail, password, persona } = req.body;

    try {
      if (mail || password) {
        validarUsuario({ mail, password });
      }
      if (persona) {
        validarPersona(persona);
      }

      const userRef = db.collection("usuarios").doc(userId);
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
      res.status(200).json({ id: userId, ...updatedData });
    } catch (e) {
      console.error("Error al actualizar el usuario: ", e.message);
      res.status(400).json({ error: e.message });
    }
  }

  // Eliminar un usuario
  async eliminarUsuario(req, res) {
    const userId = req.userId;

    try {
      const userRef = db.collection("usuarios").doc(userId);

       // Eliminar documentos de la subcolección comensales
       let snapshot = await userRef.collection("comensales").get();
       for (const doc of snapshot.docs) {
         await doc.ref.delete();
       }
 
       // Eliminar documentos de la subcolección recetas
       snapshot = await userRef.collection("recetas").get();
       for (const doc of snapshot.docs) {
         await doc.ref.delete();
       }
 
       // Eliminar documentos de la subcolección stock
       snapshot = await userRef.collection("stock").get();
       for (const doc of snapshot.docs) {
         await doc.ref.delete();
       }

      // Eliminar el documento del usuario
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
