import mongoose from "mongoose";

const { Schema } = mongoose;

const RestriccionesEnum = {
  CELIACO: 'celiaco',
  EMBARAZADA: 'embarazada',
  VEGETARIANO: 'vegetariano',
  VEGANO: 'vegano',
  DIABETES: 'diabetes',
  KOSHER: 'kosher',
  HIPERTENSION: 'hipertension',
  INTOLERANTE_LACTOSA: 'intolerante lactosa'
};

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
      type: [String],
      enum: Object.values(RestriccionesEnum),
      default: []
    },
  },
);

// Creación del modelo Persona
const Persona = mongoose.model("Persona", personaSchema);

export { Persona, personaSchema };