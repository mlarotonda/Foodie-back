const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(
  ""
);

// Definición del modelo Receta
const Receta = sequelize.define(
  "Receta",
  {
    recetaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    puntuacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 5,
      },
    },
    ingredienteRecetaId: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
      allowNull: false,
      references: {
        model: "Ingredientes",
        key: "ingredienteId",
      },
    },
  },
  {
    timestamps: true,
    tableName: "recetas",
  }
);

module.exports = Receta;
