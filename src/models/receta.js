import { Sequelize, DataTypes } from "sequelize";
import IngredienteReceta from "./ingredienteReceta";

const sequelize = new Sequelize("");

const Receta = sequelize.define(
  "Receta",
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
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
      allowNull: false,
      references: {
        model: "Ingredientes",
        key: "ingredienteId",
      },
    },
  },
  {
    timestamps: true,
    tableName: "recetas",
  }
);

Receta.hasMany(Ingrediente, {
  through: IngredienteReceta,
  uniqueKey: "ingredienteRecetaId",
});

export default Receta;
