jest.mock("../../src/db", () => ({
  pool: { query: jest.fn(), end: jest.fn() }, 
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "fake-token"),
  verify: jest.fn(),
}));

const request = require("supertest");
const express = require("express");
const { pool } = require("../../src/db");
const authRoutes = require("../../src/routes/auth");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/autenticacion", authRoutes);
  return app;
}

describe("POST /autenticacion/login", () => {
  beforeEach(() => jest.clearAllMocks());
  
  // Cerramos el pool al terminar para evitar open handles
  afterAll(async () => {
    await pool.end();
  });

  test("retorna token con credenciales válidas", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, nombre_usuario: "juan", contrasena: "123456", correo: "a@b.cl" }] })
      .mockResolvedValueOnce({ rows: [{ id: 1, nombre: "paciente" }] })
      .mockResolvedValueOnce({ rows: [{ id: 10 }] })
      .mockResolvedValueOnce({ rows: [] });

    const app = buildApp();
    const res = await request(app).post("/autenticacion/login").send({ nombre_usuario: "juan", password: "123456" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBe("fake-token");
  });
});
