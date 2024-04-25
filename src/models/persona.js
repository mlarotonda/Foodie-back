const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("localhost", "foodie", "foodie123", {
  host: "localhost",
  dialect: "mysql",
  port: 3006,
});

async function testConnection(){
  try {
    await sequelize.authenticate();
    console.log("all good")
  }
  catch (err) {
    console.log("all bad", err);
  }
}

testConnection();

// Definición del modelo Persona
const Persona = sequelize.define(
  "Persona",
  {
    personaId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
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
      allowNull: true,
    },
    restriccionesId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Restricciones",
        key: "restriccionesId",
      },
    },
  },
  {
    timestamps: false,
    tableName: "personas",
  }
);

module.exports = Persona;