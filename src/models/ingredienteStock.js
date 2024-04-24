// Importar Sequelize y configuración de la base de datos
const { DataTypes, Sequelize } = require('sequelize');
const sequelize = new Sequelize('nombre-base-de-datos', 'usuario', 'contraseña', {
  host: 'localhost',
  dialect: 'mysql' // Puedes usar el dialecto que corresponda a tu base de datos (postgres, mysql, sqlite, etc.)
});

const IngredienteStock = sequelize.define('IngredienteStock', {
  IngredienteId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  StockId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = IngredienteStock;
