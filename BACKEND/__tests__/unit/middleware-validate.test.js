const validate = require("../../src/middleware/validate");
const yup = require("yup");

const schema = yup.object().shape({
  nombre: yup.string().required("El nombre es requerido"),
});

describe("Middleware validate", () => {
  test("llama a next() si los datos son válidos", async () => {
    const req = { body: { nombre: "Ana" } };
    const res = {};
    const next = jest.fn();
    await validate(schema)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("retorna 400 y detalles si la validación falla", async () => {
    const req = { body: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();
    await validate(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Error de validación",
        detalles: expect.arrayContaining([
          expect.objectContaining({ field: "nombre" }),
        ]),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });
});
