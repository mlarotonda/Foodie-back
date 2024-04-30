import { Sequelize, DataTypes } from "sequelize";
import Persona from "./persona";
const sequelize = new Sequelize("");

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
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false,
      references: {
        model: "Persona",
        key: "personaId",
      },
    },
  },
  {
    timestamps: false,
    tableName: "grupos_familiares",
  }
);
GrupoFamiliar.hasMany(Persona);

export default GrupoFamiliar;
