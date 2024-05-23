import mongoose from "mongoose";

const { Schema } = mongoose;

// Definición del esquema para Persona
const personaSchema = new Schema(
  {
    personaId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
    },
    nombre: {
      type: String,
      required: true,
    },
    apellido: {
      type: String,
      required: true,
    },
    edad: {
      type: Number,
      required: true,
    },
    nacionalidad: {
      type: String,
      default: null,
    },
    restricciones: {
      type: Schema.Types.ObjectId,
      ref: "Restricciones",
    },
  },
  { collection: "personas" }
);

// Creación del modelo Persona
const Persona = mongoose.model("Persona", personaSchema);

export default Persona;
