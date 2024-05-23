import mongoose, { model } from "mongoose";
const { Schema } = mongoose;

const ingredienteSchema = new Schema({
  ingredienteId: {
    type: Number,
    required: true,
    unique: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  unidadMedida: {
    type: String,
    required: true,
    enum: ["Kilogramos", "Gramos", "Litros", "Mililitros", "Cucharadas"], // Validación para restringir los valores permitidos
  },
});

// Crear el modelo de Ingrediente
const Ingrediente = model("Ingrediente", ingredienteSchema);

export {Ingrediente, ingredienteSchema};
