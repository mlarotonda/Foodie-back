import Ingrediente from "./ingrediente.js";
import Persona from "./persona.js";
import Receta from "./receta.js";
import Restricciones from "./restricciones.js";
import Stock from "./stock.js";
import Usuario from "./usuario.js";

personaSchema.hasOne(restriccionesSchema);

usuarioSchema.hasOne(personaSchema);
usuarioSchema.hasOne(stockSchema);
usuarioSchema.hasOne(grupoFamiliarSchema);

const Ingrediente = mongoose.model("Ingrediente", ingredienteSchema);
const Persona = mongoose.model("Persona", personaSchema);
const Receta = mongoose.model("Receta", recetaSchema);
const Restricciones = mongoose.model("Restricciones", restriccionesSchema);
const Stock = mongoose.model("Stock", stockSchema);
const Usuario = mongoose.model("Usuario", usuarioSchema);

export {
  Ingrediente,
  Persona,
  Receta,
  Restricciones,
  Stock,
  Usuario,
};
