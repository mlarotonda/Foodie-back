import { Sequelize, DataTypes } from "sequelize";
import Usuario from "./usuario";
import Ingrediente from "./ingrediente";
import IngredienteStock from "./ingredienteStock";

const sequelize = new Sequelize("database", "username", "password", {
  host: "localhost",
  dialect: "mysql",
});

const Stock = sequelize.define("Stock", {
  stockId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  IngredienteStockId: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
  },
});
Stock.belongsTo(Usuario);
Stock.hasMany(Ingrediente, {
  through: IngredienteStock,
  uniqueKey: "IngredienteStockId",
});

export default Stock;
