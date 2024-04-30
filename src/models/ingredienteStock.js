// Importar Sequelize y configuración de la base de datos
import { DataTypes, Model } from "sequelize";
import sequelize from "../connection/connection.js";

class IngredienteStock extends Model {}

IngredienteStock.init(
  {
    IngredienteStockId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    IngredienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    StockId: {
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
    modelName: "IngredienteStock",
  }
);

export default IngredienteStock;
