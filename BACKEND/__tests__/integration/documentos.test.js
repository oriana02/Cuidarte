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
const documentosRoutes = require("../../src/routes/documentos");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/documentos", documentosRoutes);
  return app;
}

describe("Rutas de Documentos", () => {
  afterAll(async () => await pool.end());
  beforeEach(() => jest.clearAllMocks());

  describe("GET /documentos/:id", () => {
    test("retorna 404 si el documento no existe", async () => {
      jwt.verify.mockReturnValue({ usuarioId: 1 });
      pool.query.mockResolvedValueOnce({ rows: [{ nombre: "admin" }] }); // Rol
      pool.query.mockResolvedValueOnce({ rows: [] }); // Documento no encontrado

      const res = await request(buildApp())
        .get("/documentos/999")
        .set("Authorization", "Bearer fake-token");
      
      expect(res.status).toBe(404);
    });

    test("retorna 200 y el archivo si es médico", async () => {
      jwt.verify.mockReturnValue({ usuarioId: 1 });
      pool.query.mockResolvedValueOnce({ rows: [{ nombre: "medico" }] }); // Rol
      pool.query.mockResolvedValueOnce({ 
        rows: [{ id: 1, nombre_archivo: "test.pdf", documento: Buffer.from("PDF"), usuario_id: 5 }] 
      });

      const res = await request(buildApp())
        .get("/documentos/1")
        .set("Authorization", "Bearer fake-token");
      
      expect(res.status).toBe(200);
      expect(res.header['content-type']).toBe("application/pdf");
    });
  });

  describe("DELETE /documentos/:id", () => {
    test("retorna 403 si intenta borrar un médico", async () => {
      jwt.verify.mockReturnValue({ usuarioId: 1 });
      pool.query.mockResolvedValueOnce({ rows: [{ nombre: "medico" }] }); 

      const res = await request(buildApp())
        .delete("/documentos/1")
        .set("Authorization", "Bearer fake-token");
      
      expect(res.status).toBe(403);
    });
  });
});
