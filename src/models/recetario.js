const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(
  ""
);

// Definición del modelo Recetario
const Recetario = sequelize.define(
  "Recetario",
  {
    recetarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    recetaId: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
      allowNull: false,
      references: {
        model: "Receta",
        key: "recetaId",
      },
    },
  },
  {
    timestamps: false,
    tableName: "recetarios",
  }
);


module.exports = Recetario;
