import { DataTypes, Model } from "sequelize";
import sequelize from "../connection/connection.js";

class Ingrediente extends Model {}

Ingrediente.init(
  {
    ingredienteId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unidadMedida: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["Kilogramos", "Gramos", "Litros", "Mililitros"]],
      },
    },
  },
  {
    sequelize,
    modelName: "Ingrediente", // Nombre del modelo
  }
);

export default Ingrediente;
