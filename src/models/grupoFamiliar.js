import { DataTypes, Model } from "sequelize";
import sequelize from "../connection/connection.js";
import Persona from "./persona.js";

class GrupoFamiliar extends Model {}

GrupoFamiliar.init(
  {
    grupoFamiliarId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    personaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Persona,
        key: "personaId",
      },
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "grupos_familiares",
  }
);

export default GrupoFamiliar;
