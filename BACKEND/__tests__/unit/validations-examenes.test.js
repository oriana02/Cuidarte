const { examenMedicoSchema, updateExamenMedicoSchema } = require("../../src/validations/examenes");

describe("examenMedicoSchema", () => {
  test("acepta examen válido", async () => {
    await expect(examenMedicoSchema.validate({ tipo_examen_medico_id: 1, paciente_id: 2, diagnosis: "Gripe" })).resolves.toBeDefined();
  });
});

describe("updateExamenMedicoSchema", () => {
  test("acepta actualización con un campo", async () => {
    await expect(updateExamenMedicoSchema.validate({ diagnosis: "Nuevo diagnóstico" })).resolves.toBeDefined();
  });
});
