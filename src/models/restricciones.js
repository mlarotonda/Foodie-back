const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(
  ""
);

// Definición del modelo Restricciones
const Restricciones = sequelize.define(
  "Restricciones",
  {
    restriccionesId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    celiaco: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    embarazo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    vegetariano: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    vegano: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    intoleranteLactosa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "restricciones",
  }
);

module.exports = Restricciones;
