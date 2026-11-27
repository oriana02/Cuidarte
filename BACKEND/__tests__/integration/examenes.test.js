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
const examenesRoutes = require("../../src/routes/examenes");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/examenes", examenesRoutes);
  return app;
}

describe("Rutas de Exámenes", () => {
  afterAll(async () => await pool.end());
  beforeEach(() => jest.clearAllMocks());

  describe("GET /examenes", () => {
    test("filtra exámenes si el usuario es paciente", async () => {
      jwt.verify.mockReturnValue({ usuarioId: 2 });
      // Rol: paciente
      pool.query.mockResolvedValueOnce({ rows: [{ nombre: "paciente" }] });
      // ID de paciente
      pool.query.mockResolvedValueOnce({ rows: [{ id: 5 }] });
      // Resultado de exámenes
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, paciente_id: 5 }] });

      const res = await request(buildApp())
        .get("/examenes")
        .set("Authorization", "Bearer fake-token");
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe("POST /examenes", () => {
    test("crea un examen correctamente (Admin)", async () => {
      jwt.verify.mockReturnValue({ usuarioId: 1 });
      pool.query
        .mockResolvedValueOnce({ rows: [{ nombre: "admin" }] }) // Rol
        .mockResolvedValueOnce({ rows: [{ id: 1, diagnosis: "Gripe" }] }) // Insert
        .mockResolvedValueOnce({ rows: [] }); // Auditoría

      const res = await request(buildApp())
        .post("/examenes")
        .set("Authorization", "Bearer fake-token")
        .send({ tipo_examen_medico_id: 1, paciente_id: 2, diagnosis: "Gripe" });
      
      expect(res.status).toBe(201);
    });
  });
});
