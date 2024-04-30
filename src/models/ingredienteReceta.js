// Importar Sequelize y configuración de la base de datos
import { DataTypes, Model } from "sequelize";
import sequelize from "../connection/connection.js";

class IngredienteReceta extends Model {}

IngredienteReceta.init(
  {
    IngredienteRecetaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    IngredienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    RecetaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "IngredienteReceta",
  }
);

export default IngredienteReceta;
