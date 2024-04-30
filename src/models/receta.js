import { Model, DataTypes } from "sequelize";
import sequelize from "../connection/connection.js";
import Ingrediente from "./ingrediente.js";

class Receta extends Model {}

Receta.init(
  {
    recetaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    instrucciones: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    puntuacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 5,
      },
    },
    ingredienteRecetaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Ingrediente,
        key: "ingredienteId",
      },
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: "Receta",
  }
);

export default Receta;
