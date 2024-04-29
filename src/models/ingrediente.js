import { DataTypes, Sequelize } from "sequelize";
import Receta from "./receta";

const sequelize = new Sequelize(
  "nombre-base-de-datos",
  "usuario",
  "contraseña",
  {
    host: "localhost",
    dialect: "mysql",
  }
);

const Ingrediente = sequelize.define("Ingrediente", {
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
    type: DataTypes.ENUM("Kilogramos", "Gramos", "Litros", "Mililitros"),
  },
});

Ingrediente.belongsToMany(Receta, { through: IngredienteReceta });

export default Ingrediente;
