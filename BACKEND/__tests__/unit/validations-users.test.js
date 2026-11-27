const { createUserSchema, updateUserSchema } = require("../../src/validations/users");

describe("createUserSchema", () => {
  const base = { nombre_usuario: "juan", contrasena_hash: "123456", correo: "juan@example.com" };
  test("acepta usuario válido sin rol", async () => {
    await expect(createUserSchema.validate(base)).resolves.toBeDefined();
  });
});

describe("updateUserSchema", () => {
  test("acepta un campo a actualizar", async () => {
    await expect(updateUserSchema.validate({ correo: "nuevo@example.com" })).resolves.toBeDefined();
  });
});
