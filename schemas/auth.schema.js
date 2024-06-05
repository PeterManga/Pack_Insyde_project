const { z } = require("zod");

const loginSchema = z.object({
  email: z.string({ required_error: "Email necesario" }).email({ message: "Email invalido" }),
  password: z.string({ required_error: "se necesita la contraseña" }).min(4, { message: "La contraseña debe tener por lo menos 4 caracteres" }),
});

module.exports = { loginSchema };
