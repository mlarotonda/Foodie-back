// Importar Sequelize y configuración de la base de datos
const { DataTypes, Sequelize } = require('sequelize');

const sequelize = new Sequelize('nombre-base-de-datos', 'usuario', 'contraseña', {
  host: 'localhost',
  dialect: 'mysql' // Puedes usar el dialecto que corresponda a tu base de datos (postgres, mysql, sqlite, etc.)
});

const Usuario = sequelize.define('Usuario', {
  userID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  recetarioId: {
    type: DataTypes.INTEGER
  },
  historialId: {
    type: DataTypes.JSON // Lista de enteros (en este ejemplo se almacena como JSON)
  },
  personaId: {
    type: DataTypes.INTEGER
  },
  restriccionesId: {
    type: DataTypes.INTEGER
  },
  stockId: {
    type: DataTypes.INTEGER
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  contrasena: {
    type: DataTypes.STRING,
    allowNull: false
  },
  grupoFamiliarId: {
    type: DataTypes.INTEGER
  }
});

module.exports = Usuario;