// Importar Sequelize y configuración de la base de datos
import { DataTypes, Sequelize } from "sequelize";
const sequelize = new Sequelize(
  "nombre-base-de-datos",
  "usuario",
  "contraseña",
  {
    host: "localhost",
    dialect: "mysql",
  }
);

const IngredienteStock = sequelize.define("IngredienteStock", {
  IngredienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
  },
  StockId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export default IngredienteStock;
