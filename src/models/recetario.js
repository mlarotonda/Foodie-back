import { Model, DataTypes } from "sequelize";
import sequelize from "../connection/connection.js";
import Receta from "./receta.js";

class Recetario extends Model {}

Recetario.init(
  {
    recetarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    recetaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Receta,
        key: "recetaId",
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "Recetario",
  }
);

export default Recetario;
