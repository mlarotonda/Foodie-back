import sequelize from "../connection/connection.js";
import { Model, DataTypes } from "sequelize";

class Stock extends Model {}

Stock.init(
  {
    stockId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    IngredienteStockId: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    modelName: "Stock",
  }
);

export default Stock;
