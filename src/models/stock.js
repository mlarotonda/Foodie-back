import { Schema as _Schema, model } from "mongoose";

const Schema = _Schema;

const stockSchema = new Schema({
  stockId: {
      type: Number,
      required: true,
      unique: true,
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
});

const Stock = model("Stock", stockSchema);

export { Stock, stockSchema};
