const { pacienteSchema, updatePacienteSchema } = require("../../src/validations/pacientes");

const pacienteValido = { rut: "12.345.678-9", primer_nombre: "Juan", apellido_paterno: "Pérez", fecha_nacimiento: new Date("1990-01-01"), sexo: "M", email: "juan@example.com" };

describe("pacienteSchema", () => {
  test("acepta paciente válido mínimo", async () => {
    await expect(pacienteSchema.validate(pacienteValido)).resolves.toBeDefined();
  });
});

describe("updatePacienteSchema", () => {
  test("acepta actualización con un campo", async () => {
    await expect(updatePacienteSchema.validate({ telefono: "+56912345678" })).resolves.toBeDefined();
  });
});
