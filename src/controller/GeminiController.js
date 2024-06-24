import { db } from "../connection/firebaseConnection.js";
import axios from "axios";
import createModel from "../connection/geminiConnection.js";

class GeminiController{

  generarTipoDeProducto = async (nombresProductos) => {
    const model = await createModel();

    const productosSnapshot = await db.collection("productos").get();
    const tiposDeProductos = productosSnapshot.docs
      .map((doc) => doc.id)
      .join(", ");

    const prompt = `Tengo los siguientes productos: ${nombresProductos.join(
      ", "
    )}. En base a sus nombres, a qué tipo de producto pertenecen? Elegir un ÚNICO tipo de producto. Las opciones son: ${tiposDeProductos}. IMPORTANTE: Responde SOLO con el tipo de producto correspondiente`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = await result.response;
      const text = await responseText.text();
      const tipoDeProducto = text.trim();
      console.log(`Tipo de producto generado: ${tipoDeProducto}`);

      if (!tipoDeProducto || tipoDeProducto.trim() === "") {
        return null;
      } else {
        const productoDoc = await db
          .collection("productos")
          .doc(cleanedText.replace(".", ""))
          .get();
        console.log(productoDoc);
        if (productoDoc.exists) {
          const productoData = productoDoc.data();
          return {
            tipo: cleanedText,
            unidad: productoData.unidadMedida,
            imageUrl: productoData.imageUrl,
          };
        } else {
          return {
            tipo: cleanedText,
            unidad: null,
            imageUrl: null,
          };
        }
      }
    } catch (error) {
      throw new Error(
        `Error al generar contenido con el modelo: ${error.message}`
      );
    }
  };

  getUserRecipes = async (req, res) => {
    console.log("------request");

    const model = await createModel();

      const userId = req.user.id;
      const comida = req.body
  
      try {
        const userDoc = await db.collection('usuarios').doc(userId).get();
        if (!userDoc.exists) {
          throw new Error('Usuario no encontrado');
        }
  
        const userData = userDoc.data();
        console.log("Datos del usuario:", userData);
  
        const stockSnapshot = await db.collection('usuarios').doc(userId).collection('stock').get();
        const stockItems = stockSnapshot.docs.map(doc => ({
          nombre: doc.id,
          cantidad: doc.data().cantidad,
          unidadMedida: doc.data().unidad
        }));
        console.log("Productos en el stock del usuario:", stockItems);
  
        const restrictions = userData.persona.restricciones || [];
        console.log("Restricciones del usuario:", restrictions);
  
        const productosSnapshot = await db.collection('productos').get();
        const productos = productosSnapshot.docs.map(doc => ({ nombre: doc.id, unidadMedida: doc.data().unidadMedida }));
        console.log("Productos en la colección de Firestore:", productos);
  
        const ingredientesPrompt = stockItems.map(item => `${item.nombre}: ${item.cantidad} ${item.unidadMedida}`).join(', ');
        const restriccionesPrompt = restrictions.join(", ")
        const productosPrompt = productos.map(p => `${p.nombre} medido en ${p.unidadMedida}`).join(', ');
  
        let prompt = `
          Dar 3 recetas de ${comida} que se puedan realizar utilizando SOLO y UNICAMENTE los ingredientes en el stock del usuario. Ingredientes en stock: ${ingredientesPrompt}.
          El usuario no tiene acceso a otros ingredientes asi que las recetas deben contener UNICAMENTE lo que esta en stock.
          No asumas que el usuario tiene mas ingredientes de los que estan en su stock, la unica excepcion es agua.
          Adapta los ingredientes de las recetas para que coincidan pura y exclusivamente con los siguientes nombres y sus respectivas unidades de medida: ${productosPrompt}. No los modifiques en lo mas minimo en ningun momento.
          Las recetas deben estar pensadas para una sola persona, y las porciones pueden ser ajustadas para coincidir con eso.
          Las porciones de los ingredientes deben estar medidas UNICAMENTE en "gramos", "mililitros" o "unidades", convertir las demás a la que sea más conveniente. NO USAR ABREVIACIONES
          Devolver las 3 recetas en formato JSON, con los campos {name, ingredients (description, quantity, unit), steps (1,2,3,etc)}.
        `;
  
        if (restrictions.length > 0) {
          prompt += ` Tener en cuenta las restricciones de la persona: ${restriccionesPrompt}.`;
        }
  
        const result = await model.generateContent(prompt);
        const responseText = await result.response;
        const rawText = await responseText.text();
  
        const finalJson = await parseadorJson(rawText);
        await asignarImagen(finalJson);
  
        console.log("--response");
        console.log("Final JSON:", finalJson);
        return res.status(200).send(finalJson);
      } catch (error) {
        console.error('Error fetching data from external API:', error);
        return res.status(500).send({ success: false, message: 'Error al obtener datos de la API externa: ' + error.message });
      }
    };

    getUserGuestsRecipes = async (req, res) => {
      console.log("------request");
  
      const model = await createModel();

      const userId = req.user.id;
      const {personas, comida} = req.body;
  
      try {
        const userDoc = await db.collection('usuarios').doc(userId).get();
        if (!userDoc.exists) {
          throw new Error('Usuario no encontrado');
        }
  
        const userData = userDoc.data();
        console.log("Datos del usuario:", userData);
  
        const stockSnapshot = await db.collection('usuarios').doc(userId).collection('stock').get();
        const stockItems = stockSnapshot.docs.map(doc => ({
          nombre: doc.id,
          cantidad: doc.data().cantidad,
          unidadMedida: doc.data().unidad
        }));
        console.log("Productos en el stock del usuario:", stockItems);
  
        const userRestrictions = userData.persona.restricciones || [];
        let allRestrictions = [...new Set(userRestrictions)];

        for (let persona of personas) {
            const personaDoc = await db.collection('personas').doc(persona.id).get();
            if (personaDoc.exists) {
                const personaData = personaDoc.data();
                const personaRestrictions = personaData.restricciones || [];
                allRestrictions = [...new Set([...allRestrictions, ...personaRestrictions])];
            }
        }
        console.log("Restricciones combinadas:", allRestrictions);
  
        const productosSnapshot = await db.collection('productos').get();
        const productos = productosSnapshot.docs.map(doc => ({ nombre: doc.id, unidadMedida: doc.data().unidadMedida }));
        console.log("Productos en la colección de Firestore:", productos);
  
        const ingredientesPrompt = stockItems.map(item => `${item.nombre}: ${item.cantidad} ${item.unidadMedida}`).join(', ');
        const restriccionesPrompt = allRestrictions.join(", ")
        const productosPrompt = productos.map(p => `${p.nombre} medido en ${p.unidadMedida}`).join(', ');
  
        let prompt = `
          Dar 3 recetas de ${comida} que se puedan realizar utilizando SOLO y UNICAMENTE los ingredientes en el stock del usuario. Ingredientes en stock: ${ingredientesPrompt}.
          El usuario no tiene acceso a otros ingredientes asi que las recetas deben contener UNICAMENTE lo que esta en stock.
          No asumas que el usuario tiene mas ingredientes de los que estan en su stock, la unica excepcion es agua.
          Adapta los ingredientes de las recetas para que coincidan pura y exclusivamente con los siguientes nombres y sus respectivas unidades de medida: ${productosPrompt}. No los modifiques en lo mas minimo en ningun momento.
          Las recetas deben estar pensadas para ${personas.length + 1} personas, y las porciones pueden ser ajustadas para coincidir con eso.
          Las porciones de los ingredientes deben estar medidas UNICAMENTE en "gramos", "mililitros" o "unidades", convertir las demás a la que sea más conveniente. NO USAR ABREVIACIONES
          Devolver las 3 recetas en formato JSON, con los campos {name, ingredients (description, quantity, unit), steps (1,2,3,etc)}.
        `;
  
        if (allRestrictions.length > 0) {
          prompt += ` Tener en cuenta las restricciones de las personas: ${restriccionesPrompt}.`;
        }
  
        const result = await model.generateContent(prompt);
        const responseText = await result.response;
        const rawText = await responseText.text();
  
        const finalJson = await parseadorJson(rawText);
        await asignarImagen(finalJson);
  
        console.log("--response");
        console.log("Final JSON:", finalJson);
        return res.status(200).send(finalJson);
      } catch (error) {
        console.error('Error fetching data from external API:', error);
        return res.status(500).send({ success: false, message: 'Error al obtener datos de la API externa: ' + error.message });
      }
    };

  getRandomRecipes = async (req, res) => {
    console.log("------request");

    const model = await createModel();

    const userId = req.user.id;
    const comida = req.body;

    try {
      const userDoc = await db.collection("usuarios").doc(userId).get();
      if (!userDoc.exists) {
        throw new Error("Usuario no encontrado");
      }

      const userData = userDoc.data();
      console.log("Datos del usuario:", userData);

      const restrictions = userData.persona.restricciones || [];
      console.log("Restricciones del usuario:", restrictions);

      const productosSnapshot = await db.collection("productos").get();
      const productos = productosSnapshot.docs.map((doc) => ({
        nombre: doc.id,
        unidadMedida: doc.data().unidadMedida,
      }));
      console.log("Productos en la colección de Firestore:", productos);

      const restriccionesPrompt = restrictions.join(", ");
      const productosPrompt = productos
        .map((p) => `${p.nombre} medido en ${p.unidadMedida}`)
        .join(", ");

      let prompt = `
          Dar 3 recetas de ${comida}
          Adapta los ingredientes de las recetas para que coincidan exactamente con los siguientes nombres y sus respectivas unidades de medida: ${productosPrompt}. No los modifiques en lo mas minimo en ningun momento.
          Las recetas deben estar pensadas para una sola persona, y las porciones pueden ser ajustadas para coincidir con eso.
          Las porciones de los ingredientes deben estar medidas UNICAMENTE en "gramos", "mililitros" o "unidades", convertir las demás a la que sea más conveniente. NO USAR ABREVIACIONES
          Devolver las 3 recetas en formato JSON, con los campos {name, ingredients (description, quantity, unit), steps (1,2,3,etc)}.
        `;
  
        if (restrictions.length > 0) {
          prompt += ` Es importante tener en cuenta las restricciones de la persona: ${restriccionesPrompt}.`;
        }
  
        const result = await model.generateContent(prompt);
        const responseText = await result.response;
        const rawText = await responseText.text();
  
        const finalJson = await parseadorJson(rawText);
        await asignarImagen(finalJson);
  
        console.log("--response");
        console.log("Final JSON:", finalJson);
        return res.status(200).send(finalJson);
      } catch (error) {
        console.error('Error fetching data from external API:', error);
        return res.status(500).send({ success: false, message: 'Error al obtener datos de la API externa: ' + error.message });
      }
    };

    getRandomGuestsRecipes = async (req, res) => {
      console.log("------request");
  
      const model = await createModel();

      const userId = req.user.id;
      const {personas, comida} = req.body;
  
      try {
        const userDoc = await db.collection('usuarios').doc(userId).get();
        if (!userDoc.exists) {
          throw new Error('Usuario no encontrado');
        }
  
        const userData = userDoc.data();
        console.log("Datos del usuario:", userData);
  
        const userRestrictions = userData.persona.restricciones || [];
        let allRestrictions = [...new Set(userRestrictions)];

        let cantidadPersonas = 1;

        if(personas!==null){
          for (let persona of personas) {
              const personaDoc = await db.collection('personas').doc(persona.id).get();
              if (personaDoc.exists) {
                  const personaData = personaDoc.data();
                  const personaRestrictions = personaData.restricciones || [];
                  allRestrictions = [...new Set([...allRestrictions, ...personaRestrictions])];
              }
          }
          console.log("Restricciones combinadas:", allRestrictions);
          cantidadPersonas += personas.length();
        }
  
        const productosSnapshot = await db.collection('productos').get();
        const productos = productosSnapshot.docs.map(doc => ({ nombre: doc.id, unidadMedida: doc.data().unidadMedida }));
        console.log("Productos en la colección de Firestore:", productos);
  
        const restriccionesPrompt = allRestrictions.join(", ")
        const productosPrompt = productos.map(p => `${p.nombre} medido en ${p.unidadMedida}`).join(', ');
  
        let prompt = `
          Dar 3 recetas de ${comida}
          Adapta los ingredientes de las recetas para que coincidan pura y exclusivamente con los siguientes nombres y sus respectivas unidades de medida: ${productosPrompt}. No los modifiques en lo mas minimo en ningun momento.
          Las recetas deben estar pensadas para ${cantidadPersonas} personas, y las porciones pueden ser ajustadas para coincidir con eso.
          Las porciones de los ingredientes deben estar medidas UNICAMENTE en "gramos", "mililitros" o "unidades", convertir las demás a la que sea más conveniente. NO USAR ABREVIACIONES
          Devolver las 3 recetas en formato JSON, con los campos {name, ingredients (description, quantity, unit), steps (1,2,3,etc)}.
        `;
  
        if (allRestrictions.length > 0) {
          prompt += ` Tener en cuenta las restricciones de las personas: ${restriccionesPrompt}.`;
        }
  
        const result = await model.generateContent(prompt);
        const responseText = await result.response;
        const rawText = await responseText.text();
  
        const finalJson = await parseadorJson(rawText);
        await asignarImagen(finalJson);
  
        console.log("--response");
        console.log("Final JSON:", finalJson);
        return res.status(200).send(finalJson);
      } catch (error) {
        console.error('Error fetching data from external API:', error);
        return res.status(500).send({ success: false, message: 'Error al obtener datos de la API externa: ' + error.message });
      }
    };
}
export default new GeminiController();

const parseadorJson = (rawText) => {

  console.log("Raw text received from API:", rawText);

  const cleanedText = rawText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/\\n/g, '')
      .replace(/\\t/g, '')
      .trim();

  console.log("Cleaned text:", cleanedText);

  let finalJson;
  try {
      finalJson = JSON.parse(cleanedText);
  } catch (error) {
      throw new Error('Formato de respuesta de la API externa inesperado: ' + error.message);
  }
  return finalJson;
};

const asignarImagen = async (recipes) => {
  for (let recipe of recipes) {
      const searchTerm = recipe.name.replace(' ', '+');
      recipe.imageUrl = await getFirstImageUrl(searchTerm);

      // Log the ingredients of each recipe
      console.log(`Ingredientes de la receta ${recipe.name}:`, recipe.ingredients);
  }
  return recipes;
};

const getFirstImageUrl = async (searchTerm) => {
  const cx = "d4a81011643ae44dd";
  const apikey = "AIzaSyAS84CqIgescRVP2lv-G1X8k9TwiKJ7Jwo";
  const url = `https://www.googleapis.com/customsearch/v1?key=${apikey}&cx=${cx}&q=${searchTerm}&searchType=IMAGE&num=1`;

  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      console.error(`Error al obtener la URL de la imagen: ${response.status}`);
      return null;
    }

    const firstImage = response.data.items[0].link;
    return firstImage ? firstImage : null;
  } catch (error) {
    console.error(`Error al obtener la URL de la imagen: ${error}`);
    return null;
  }
};
