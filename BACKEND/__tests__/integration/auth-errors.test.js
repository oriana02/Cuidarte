const express = require("express");
const request = require("supertest");
const { pool } = require("../../src/db");

const authRouter = require("../../src/routes/auth");

const app = express();
app.use(express.json());
app.use("/autenticacion", authRouter);

jest.mock("../../src/db", () => ({
  pool: { query: jest.fn() },
}));

describe("Rutas Auth - Caminos de error", () => {
  beforeEach(() => jest.clearAllMocks());

  test("retorna 401 si el usuario no existe", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const res = await request(app)
      .post("/autenticacion/login")
      .send({ nombre_usuario: "noexiste", password: "123456" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Credenciales inválidas");
  });

  test("retorna 401 si la contraseña es incorrecta", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id: 1, nombre_usuario: "test", contrasena: "correcta" }],
    });
    const res = await request(app)
      .post("/autenticacion/login")
      .send({ nombre_usuario: "test", password: "incorrecta" });

    expect(res.status).toBe(401);
  });
});
