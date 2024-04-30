import { DataTypes, Model } from "sequelize";
import sequelize from "../connection/connection.js";
import Recetario from "./recetario.js";
import Persona from "./persona.js";
import Stock from "./stock.js";

class Usuario extends Model {}

Usuario.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },
    recetarioId: {
      type: DataTypes.INTEGER,
      references: {
        model: Recetario,
        key: "recetarioId",
      },
    },
    historialId: {
      type: DataTypes.UUID,
    },
    personaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Persona,
        key: "personaId",
      },
    },
    stockId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Stock,
        key: "stockId",
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
      contrasena: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isSecurePassword(value) {
            if (
              !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}/.test(
                value
              )
            ) {
              throw new Error(
                "La contraseña debe contener al menos una mayúscula, un número, un carácter especial y tener una longitud mínima de 8 caracteres."
              );
            }
          },
        },
      },
      grupoFamiliarId: {
        type: DataTypes.INTEGER,
      },
    },
  },
  {
    sequelize,
    modelName: "Usuario",
  }
);

export default Usuario;
