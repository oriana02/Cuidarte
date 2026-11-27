jest.mock("../../src/db", () => ({
  pool: { query: jest.fn(), end: jest.fn() },
}));
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

const request = require("supertest");
const express = require("express");
const { pool } = require("../../src/db");
const jwt = require("jsonwebtoken");
const auditRoutes = require("../../src/routes/audit");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/auditoria", auditRoutes);
  return app;
}

describe("Rutas de Auditoría", () => {
  afterAll(async () => await pool.end());
  beforeEach(() => jest.clearAllMocks());

  describe("POST /auditoria", () => {
    test("retorna 401 si no hay token", async () => {
      const res = await request(buildApp()).post("/auditoria").send({ accion: "test" });
      expect(res.status).toBe(401);
    });

    test("registra un log de auditoría correctamente", async () => {
      jwt.verify.mockReturnValue({ usuarioId: 1 });
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, accion: "LOGIN" }] });

      const res = await request(buildApp())
        .post("/auditoria")
        .set("Authorization", "Bearer fake-token")
        .send({ accion: "LOGIN", detalles: "exitoso" });
      
      expect(res.status).toBe(201);
      expect(res.body.accion).toBe("LOGIN");
    });
  });

  describe("GET /auditoria", () => {
    test("retorna 403 si un usuario normal (sin rol admin) intenta ver los logs", async () => {
      jwt.verify.mockReturnValue({ usuarioId: 2 });
      // Simulamos que el usuario tiene rol "paciente" (no admin)
      pool.query.mockResolvedValueOnce({ rows: [{ nombre: "paciente" }] });

      const res = await request(buildApp())
        .get("/auditoria")
        .set("Authorization", "Bearer fake-token");
      
      expect(res.status).toBe(403);
    });

    test("retorna los logs si el usuario es admin", async () => {
      jwt.verify.mockReturnValue({ usuarioId: 1 });
      // Rol admin
      pool.query.mockResolvedValueOnce({ rows: [{ nombre: "admin" }] });
      // Logs de auditoría
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, accion: "TEST" }] });

      const res = await request(buildApp())
        .get("/auditoria")
        .set("Authorization", "Bearer fake-token");
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });
});
