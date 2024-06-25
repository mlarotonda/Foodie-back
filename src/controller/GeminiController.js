import { db } from "../connection/firebaseConnection.js";
import axios from "axios";
import createModel from "../connection/geminiConnection.js";

class GeminiController {
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
    const { comensales, comida } = req.body;

    try {
      const userDoc = await db.collection("usuarios").doc(userId).get();
      if (!userDoc.exists) {
        throw new Error("Usuario no encontrado");
      }

      const userData = userDoc.data();
      console.log("Datos del usuario:", userData);

      const stockSnapshot = await db
        .collection("usuarios")
        .doc(userId)
        .collection("stock")
        .get();
      const stockItems = stockSnapshot.docs.map((doc) => ({
        nombre: doc.id,
        cantidad: doc.data().cantidad,
        unidadMedida: doc.data().unidadMedida,
      }));
      console.log("Productos en el stock del usuario:", stockItems);

      const userRestrictions = userData.persona.restricciones || [];
      let allRestrictions = [...new Set(userRestrictions)];

      let cantidadPersonas = 1;

      if (comensales !== null) {
        for (let persona of comensales) {
          const personaDoc = await db
            .collection("personas")
            .doc(persona.id)
            .get();
          if (personaDoc.exists) {
            const personaData = personaDoc.data();
            const personaRestrictions = personaData.restricciones || [];
            allRestrictions = [
              ...new Set([...allRestrictions, ...personaRestrictions]),
            ];
          }
        }
        console.log("Restricciones combinadas:", allRestrictions);
        cantidadPersonas += comensales.length;
      }
      console.log(`${cantidadPersonas} comensales en total`);

      const productosSnapshot = await db.collection("productos").get();
      const productos = productosSnapshot.docs.map((doc) => ({
        nombre: doc.id,
        unidadMedida: doc.data().unidadMedida,
      }));
      //console.log("Productos en la colección de Firestore:", productos);

      const ingredientesPrompt = stockItems
        .map((item) => `${item.nombre}: ${item.cantidad} ${item.unidadMedida}`)
        .join(", ");
      const restriccionesPrompt = allRestrictions.join(", ");
      const productosPrompt = productos
        .map((p) => `${p.nombre} medido en ${p.unidadMedida}`)
        .join(", ");

      let prompt = `
            Tengo la siguiente lista de ingredientes con sus respectivas unidades de medida: ${productosPrompt}.
            Ingredientes en stock del usuario: ${ingredientesPrompt}.
            Teniendo en cuenta el stock, dame 3 recetas de ${comida}.
            IMPORTANTE: Los ingredientes de las recetas deben tener el nombre de los que están en la lista anterior, debes cambiar el nombre de los ingredientes para que sean exactamente iguales a alguno de la lista. ESTO ES UN REQUERIMIENTO EXCLUYENTE.
            Calcula las porciones para ${cantidadPersonas} personas.
            Las porciones de los ingredientes deben estar medidas UNICAMENTE en "gramos", "mililitros" o "unidades", convertir las demás a la que sea más conveniente. NO USAR ABREVIACIONES.
            Devolver las 3 recetas en formato JSON, con los campos {name, ingredients (description, quantity, unit), steps (1,2,3,etc)}.
          `;

      if (allRestrictions.length > 0) {
        prompt += ` Tener en cuenta las restricciones de las personas: ${restriccionesPrompt}.`;
      }

      const result = await model.generateContent(prompt);
      const responseText = await result.response;
      const rawText = await responseText.text();

      const finalJson = await parseadorJson(rawText);

      // Formatear descripciones de ingredientes
      finalJson.forEach((recipe) => {
        recipe.ingredients.forEach((ingredient) => {
          ingredient.description = formatDescription(ingredient.description);
        });
      });

      await asignarImagen(finalJson);

      console.log("--response");
      console.log("Final JSON:", finalJson);

      await coincidenciasConProductos(finalJson);
      await coincidenciasConStock(finalJson, userId);

      return res.status(200).send(finalJson);
    } catch (error) {
      console.error("Error fetching data from external API:", error);
      return res
        .status(500)
        .send({
          success: false,
          message: "Error al obtener datos de la API externa: " + error.message,
        });
    }
  };

  getRandomRecipes = async (req, res) => {
    console.log("------request");

    const model = await createModel();

    const userId = req.user.id;
    const { comensales, comida } = req.body;

    try {
      const userDoc = await db.collection("usuarios").doc(userId).get();
      if (!userDoc.exists) {
        throw new Error("Usuario no encontrado");
      }

      const userData = userDoc.data();
      console.log("Datos del usuario:", userData);

      const userRestrictions = userData.persona.restricciones || [];
      let allRestrictions = [...new Set(userRestrictions)];

      let cantidadPersonas = 1;

      if (comensales !== null) {
        for (let persona of comensales) {
          const personaDoc = await db
            .collection("personas")
            .doc(persona.id)
            .get();
          if (personaDoc.exists) {
            const personaData = personaDoc.data();
            const personaRestrictions = personaData.restricciones || [];
            allRestrictions = [
              ...new Set([...allRestrictions, ...personaRestrictions]),
            ];
          }
        }
        console.log("Restricciones combinadas:", allRestrictions);
        cantidadPersonas += comensales.length;
      }
      console.log(`${cantidadPersonas} comensales en total`);

      const productosSnapshot = await db.collection("productos").get();
      const productos = productosSnapshot.docs.map((doc) => ({
        nombre: doc.id,
        unidadMedida: doc.data().unidadMedida,
      }));
      console.log("Productos en la colección de Firestore:", productos);

      const restriccionesPrompt = allRestrictions.join(", ");
      const productosPrompt = productos
        .map((p) => `${p.nombre} medido en ${p.unidadMedida}`)
        .join(", ");

      let prompt = `
          Tengo la siguiente lista de ingredientes con sus respectivas unidades de medida: ${productosPrompt}
          Teniendo en cuenta la lista, dame 3 recetas de ${comida} muy distintas una de la otra.
          IMPORTANTE: Los ingredientes de las recetas deben tener el nombre de los que estan en la lista anterior, debes cambiar el nombre de los ingredientes para que sean exactamente iguales a alguno de la lista. ESTO ES UN REQUERIMIENTO EXCLUYENTE
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

      // Formatear descripciones de ingredientes
      finalJson.forEach((recipe) => {
        recipe.ingredients.forEach((ingredient) => {
          ingredient.description = formatDescription(ingredient.description);
        });
      });

      await asignarImagen(finalJson);
      await calcularCosto(finalJson);

      console.log("--response");
      console.log("Final JSON:", finalJson);

      await coincidenciasConProductos(finalJson);

      return res.status(200).send(finalJson);
    } catch (error) {
      console.error("Error fetching data from external API:", error);
      return res
        .status(500)
        .send({
          success: false,
          message: "Error al obtener datos de la API externa: " + error.message,
        });
    }
  };
}
export default new GeminiController();

const parseadorJson = (rawText) => {
  const cleanedText = rawText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/\\n/g, "")
    .replace(/\\t/g, "")
    .trim();

  let finalJson;
  try {
    finalJson = JSON.parse(cleanedText);
  } catch (error) {
    throw new Error(
      "Formato de respuesta de la API externa inesperado: " + error.message
    );
  }
  return finalJson;
};

const asignarImagen = async (recipes) => {
  for (let recipe of recipes) {
    const searchTerm = recipe.name.replace(" ", "+");
    recipe.imageUrl = await getFirstImageUrl(searchTerm);

    // Log the ingredients of each recipe
    console.log(
      `Ingredientes de la receta ${recipe.name}:`,
      recipe.ingredients
    );
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

const calcularCosto = async (recipes) => {
  for (let recipe of recipes) {
    let costoTotal = 0;

    for (let ingrediente of recipe.ingredients) {
      try {
        const productoDoc = await db
          .collection("productos")
          .doc(ingrediente.description)
          .get();
        if (productoDoc.exists) {
          const productoData = productoDoc.data();
          let costoIngrediente;

          if (productoData.costoEstimado !== undefined) {
            console.log(
              `Costo estimado de ${ingrediente.description}: ${productoData.costoEstimado}`
            );
            costoIngrediente =
              productoData.costoEstimado * ingrediente.quantity;
          } else {
            console.log(
              `El ingrediente ${ingrediente.description} no tiene costoEstimado asignado. Asignando 5 pesos.`
            );
            costoIngrediente = 5 * ingrediente.quantity;
          }

          costoTotal += costoIngrediente;
        } else {
          // Si el producto no se encuentra en la colección, sumar una parte proporcional de costoTotal
          console.log(`${ingrediente.description} no se encuentra en la db`);
          costoTotal += costoTotal * (1 / recipe.ingredients.length);
        }
      } catch (error) {
        console.error(
          `Error al obtener el costo del ingrediente ${ingrediente.description}: ${error.message}`
        );
      }
    }

    console.log(`Costo estimado para ${recipe.name}: ${costoTotal}`);
    recipe.costoEstimado = parseFloat(costoTotal.toFixed(2));
  }
};

const coincidenciasConStock = async (recipes, userId) => {
  const stockSnapshot = await db
    .collection("usuarios")
    .doc(userId)
    .collection("stock")
    .get();
  const productos = stockSnapshot.docs.map((doc) => doc.id);

  console.log(`--- Coincidencias con stock de ${userId}: ---`);

  for (let recipe of recipes) {
    let ingredientesEncontrados = 0;
    let ingredientesNoEncontrados = [];

    for (let ingrediente of recipe.ingredients) {
      if (productos.includes(ingrediente.description)) {
        ingredientesEncontrados++;
      } else {
        ingredientesNoEncontrados.push(ingrediente.description);
      }
    }

    const porcentajeEncontrados =
      (ingredientesEncontrados / recipe.ingredients.length) * 100;
    console.log(`Receta: ${recipe.name}`);
    console.log(
      `Porcentaje de ingredientes encontrados: ${porcentajeEncontrados.toFixed(
        2
      )}%`
    );
    console.log(
      `Ingredientes no encontrados: ${ingredientesNoEncontrados.join(", ")}`
    );
  }
};

const formatDescription = (description) => {
  return (
    description.charAt(0).toUpperCase() + description.slice(1).toLowerCase()
  );
};

const coincidenciasConProductos = async (recipes) => {
  const productosSnapshot = await db.collection("productos").get();
  const productos = productosSnapshot.docs.map((doc) => doc.id);

  console.log(`Coincidencias con coleccion de productos:`);

  let ingredientesNoEncontrados = [];

  for (let recipe of recipes) {
    let ingredientesEncontrados = 0;

    for (let ingrediente of recipe.ingredients) {
      if (productos.includes(ingrediente.description)) {
        ingredientesEncontrados++;
      } else {
        ingredientesNoEncontrados.push(ingrediente.description);
      }
    }

    const porcentajeEncontrados =
      (ingredientesEncontrados / recipe.ingredients.length) * 100;
    console.log(`Receta: ${recipe.name}`);
    console.log(
      `Porcentaje de ingredientes encontrados: ${porcentajeEncontrados.toFixed(
        2
      )}%`
    );
    console.log(
      `Ingredientes no encontrados: ${ingredientesNoEncontrados.join(", ")}`
    );
  }
};