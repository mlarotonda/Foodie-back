import { Sequelize, DataTypes } from "sequelize";
import Usuario from "./usuario";
const sequelize = new Sequelize("");

const Recetario = sequelize.define(
  "Recetario",
  {
    recetarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
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

Recetario.belongsTo(Usuario);

export default Recetario;
