import GrupoFamiliar from "./grupoFamiliar.js";
import Ingrediente from "./ingrediente.js";
import IngredienteStock from "./ingredienteStock.js";
import IngredienteReceta from "./ingredienteReceta.js";
import Persona from "./persona.js";
import Receta from "./receta.js";
import Recetario from "./recetario.js";
import Restricciones from "./restricciones.js";
import Stock from "./stock.js";
import Usuario from "./usuario.js";

GrupoFamiliar.hasMany(Persona);

Ingrediente.belongsToMany(Receta, { through: IngredienteReceta });

Persona.hasOne(Restricciones);
Persona.belongsTo(GrupoFamiliar);

Receta.belongsToMany(Ingrediente, {
  through: IngredienteReceta,
  uniqueKey: "ingredienteRecetaId",
});

Recetario.belongsTo(Usuario);

Restricciones.belongsTo(Persona);

Stock.belongsTo(Usuario);
Stock.belongsToMany(Ingrediente, {
  through: IngredienteStock,
  uniqueKey: "IngredienteStockId",
});

Usuario.hasOne(Persona);
Usuario.hasOne(Stock);
Usuario.hasOne(GrupoFamiliar);
Usuario.belongsToMany(Receta, {
  through: Recetario,
  uniqueKey: "recetarioId",
});

export {
  GrupoFamiliar,
  Ingrediente,
  Persona,
  Receta,
  Recetario,
  Restricciones,
  Stock,
  Usuario,
};
