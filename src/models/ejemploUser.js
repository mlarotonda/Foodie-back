import { DataTypes, Model } from "sequelize";
import connection from "../connection/connection.js";

class User extends Model { }

//Ejemplo, despues borrar
User.init(
  {
    userLogin: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    userPassword: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    nickName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
  },
  {
    sequelize: connection,
    modelName: "User",
  }
);

export default User