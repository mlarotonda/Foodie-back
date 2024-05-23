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
    descripcion: {
      type: String,
      required: true,
    },
    instrucciones: {
      type: String,
      required: true,
    },
    puntuacion: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    ingredientes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Ingrediente",
      },
    ],
    cantidad: [
      {
        type: Number,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

// Creación del modelo Receta
const Receta = mongoose.model("Receta", recetaSchema);

export default Receta;
