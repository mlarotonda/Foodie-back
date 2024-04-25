// Importar Sequelize y configuración de la base de datos
const { DataTypes, Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "nombre-base-de-datos",
  "usuario",
  "contraseña",
  {
    host: "localhost",
    dialect: "mysql",
  }
);

const Usuario = sequelize.define("Usuario", {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  },
  recetarioId: {
    type: DataTypes.INTEGER,
    references: {
      model: "Recetario",
      key: "recetarioId",
    },
  },
  historialId: {
    type: DataTypes.JSON, // Lista de enteros (en este ejemplo se almacena como JSON)
  },
  personaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Persona",
      key: "personaId",
    },
  },
  stockId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Stock",
      key: "stockId",
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
});

module.exports = Usuario;