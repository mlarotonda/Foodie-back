import mongoose, { model } from "mongoose";
const { Schema } = mongoose;

// Definir el esquema de Usuario
const usuarioSchema = new Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
  },
  recetario: [
    {
      type: Schema.Types.ObjectId,
      ref: "Receta",
    },
  ],
  persona: {
    type: Schema.Types.ObjectId,
    ref: "Persona",
    required: true,
  },
  stock: {
    type: Schema.Types.ObjectId,
    ref: "Stock",
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: (props) => `${props.value} no es un email válido.`,
    },
  },
  contrasena: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}/.test(
          v
        );
      },
      message:
        "La contraseña debe contener al menos una mayúscula, un número, un carácter especial y tener una longitud mínima de 8 caracteres.",
    },
  },
  grupoFamiliar: [
    {
      type: Schema.Types.ObjectId,
      ref: "Persona",
    },
  ],
});

// Crear el modelo de Usuario
const Usuario = model("Usuario", usuarioSchema);

export { Usuario, usuarioSchema};
