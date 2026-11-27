const { pacienteSchema } = require("../../src/validations/pacientes");

describe("Validaciones de Yup - Caminos de error", () => {
  test("pacienteSchema falla si falta el RUT", async () => {
    try {
      await pacienteSchema.validate({}, { abortEarly: false });
    } catch (error) {
      const fields = error.inner.map((e) => e.path);
      expect(fields).toContain("rut");
    }
  });

  test("pacienteSchema falla si el RUT tiene mal formato", async () => {
    const data = {
      rut: "12345",
      primer_nombre: "Ana",
      apellido_paterno: "Paz",
      fecha_nacimiento: "1990-01-01",
      sexo: "F",
      email: "ana@test.cl",
    };
    try {
      await pacienteSchema.validate(data, { abortEarly: false });
    } catch (error) {
      const rutError = error.inner.find((e) => e.path === "rut");
      expect(rutError.message).toContain("formato válido");
    }
  });
});
