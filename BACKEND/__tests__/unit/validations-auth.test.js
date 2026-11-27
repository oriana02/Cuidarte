const { loginSchema, registerSchema } = require("../../src/validations/auth");

describe("loginSchema", () => {
  test("acepta credenciales válidas", async () => {
    await expect(loginSchema.validate({ nombre_usuario: "juan", password: "123456" })).resolves.toBeDefined();
  });
  test("rechaza nombre_usuario muy corto", async () => {
    await expect(loginSchema.validate({ nombre_usuario: "ab", password: "123456" })).rejects.toThrow();
  });
});

describe("registerSchema", () => {
  const base = { nombre_usuario: "juan", password: "123456", correo: "juan@example.com" };
  test("acepta registro válido sin RUT", async () => {
    await expect(registerSchema.validate(base)).resolves.toBeDefined();
  });
  test("acepta RUT con puntos", async () => {
    await expect(registerSchema.validate({ ...base, rut: "12.345.678-9" })).resolves.toBeDefined();
  });
});
