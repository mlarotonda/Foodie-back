import { Model, DataTypes } from "sequelize";
import sequelize from "../connection/connection.js";

class Persona extends Model {}

Persona.init(
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
    sequelize,
    timestamps: false,
    tableName: "personas",
  }
);

export default Persona;
