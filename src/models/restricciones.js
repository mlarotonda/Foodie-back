import mongoose from "mongoose";

const { Schema } = mongoose;

const restriccionesSchema = new Schema(
  {
    restriccionesId: {
      type: Number,
      required: true,
      unique: true,
    },
    celiaco: {
      type: Boolean,
      required: true,
    },
    embarazo: {
      type: Boolean,
      required: true,
    },
    vegetariano: {
      type: Boolean,
      required: true,
    },
    vegano: {
      type: Boolean,
      required: true,
    },
    intoleranteLactosa: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: false,
    collection: "restricciones", // Collection name in MongoDB
  }
);

const Restricciones = mongoose.model("Restricciones", restriccionesSchema);

export default Restricciones;