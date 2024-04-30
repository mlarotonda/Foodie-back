import { Model, DataTypes } from "sequelize";
import sequelize from "../connection/connection.js";

class Restricciones extends Model {}

// Definición del modelo Restricciones
Restricciones.init(
  {
    restriccionesId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
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
    sequelize,
    timestamps: false,
    tableName: "restricciones",
  }
);

export default Restricciones;
