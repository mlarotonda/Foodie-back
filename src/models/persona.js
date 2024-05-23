import mongoose from "mongoose";

const { Schema } = mongoose;

// Definición del esquema para Persona
const personaSchema = new Schema(
  {
    personaId: {
      type: Number,
      required: true,
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
);

// Creación del modelo Persona
const Persona = mongoose.model("Persona", personaSchema);

export { Persona, personaSchema };
