import mongoose from "mongoose";

const { Schema } = mongoose;

// Definición del esquema para la Receta
const recetaSchema = new Schema(
  {
    recetaId: {
      type: Number,
      required: true,
      unique: true,
    },
    titulo: {
      type: String,
      required: true,
    },
    instrucciones: {
      type: String,
      required: true,
    },
    puntuacion: {
      type: Number,
      min: 0,
      max: 5,
    },
    ingredientes: [
      {
        ingrediente: {
          type: Schema.Types.ObjectId,
          ref: "Ingrediente",
          required: true,
        },
        cantidad: {
          type: Number,
          required: true,
        },
      }
    ],
  },
  { timestamps: true }
);

// Creación del modelo Receta
const Receta = mongoose.model("Receta", recetaSchema);

export { Receta, recetaSchema};
