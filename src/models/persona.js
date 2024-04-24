const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  ""
);

// Definición del modelo Persona
const Persona = sequelize.define(
  "Persona",
  {
    personaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    edad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nacionalidad: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    restriccionesId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "personas",
  }
);

module.exports = Persona;