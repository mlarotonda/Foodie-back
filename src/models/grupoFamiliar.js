const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(
  ""
);

// Definición del modelo GrupoFamiliar
const GrupoFamiliar = sequelize.define(
  "GrupoFamiliar",
  {
    grupoFamiliarId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    personaId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Persona", // Nombre de la tabla referenciada
        key: "personaId", // Clave primaria de la tabla referenciada
      },
    },
  },
  {
    timestamps: false,
    tableName: "grupos_familiares",
  }
);

module.exports = GrupoFamiliar;
