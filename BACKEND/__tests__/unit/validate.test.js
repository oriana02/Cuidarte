const yup = require("yup");
const validate = require("../../src/middleware/validate");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("validate middleware", () => {
  const schema = yup.object().shape({
    nombre: yup.string().required("nombre requerido"),
    edad: yup.number().min(18, "debe ser mayor de edad"),
  });

  test("llama next cuando el body es válido", async () => {
    const req = { body: { nombre: "Juan", edad: 25 } };
    const res = mockRes();
    const next = jest.fn();
    await validate(schema)(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("retorna 400 con errores cuando la validación falla", async () => {
    const req = { body: { edad: 15 } };
    const res = mockRes();
    const next = jest.fn();
    await validate(schema)(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Error de validación" })
    );
  });

  test("valida el source 'params' cuando se especifica", async () => {
    const paramSchema = yup.object().shape({ id: yup.number().required() });
    const req = { params: { id: "abc" } };
    const res = mockRes();
    const next = jest.fn();
    await validate(paramSchema, "params")(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
