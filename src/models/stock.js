const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

const Stock = sequelize.define('Stock', {
  stockId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  IngredienteStockId: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: []
  }
});

module.exports = Stock;
