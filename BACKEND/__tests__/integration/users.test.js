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
const userRoutes = require("../../src/routes/users");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/usuarios", userRoutes);
  return app;
}

describe("Rutas de Usuarios", () => {
  afterAll(async () => await pool.end());
  beforeEach(() => jest.clearAllMocks());

  describe("POST /usuarios", () => {
    test("retorna 401 sin token (enviando datos válidos)", async () => {
      // Enviamos datos válidos para que Yup no falle y podamos evaluar el 401
      const res = await request(buildApp())
        .post("/usuarios")
        .send({ nombre_usuario: "nuevo", contrasena_hash: "123456", correo: "a@b.cl" });
      expect(res.status).toBe(401);
    });

    test("crea un usuario exitosamente (sin rol)", async () => {
      jwt.verify.mockReturnValue({ usuarioId: 1 });
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 2, nombre_usuario: "nuevo" }] }) // Insert usuario
        .mockResolvedValueOnce({ rows: [] }); // Auditoría

      const res = await request(buildApp())
        .post("/usuarios")
        .set("Authorization", "Bearer fake-token")
        .send({ nombre_usuario: "nuevo", contrasena_hash: "123456", correo: "a@b.cl" });
      
      expect(res.status).toBe(201);
    });
  });

  describe("GET /usuarios", () => {
    test("retorna 403 si no es admin", async () => {
      jwt.verify.mockReturnValue({ usuarioId: 2 });
      pool.query.mockResolvedValueOnce({ rows: [{ nombre: "paciente" }] });

      const res = await request(buildApp())
        .get("/usuarios")
        .set("Authorization", "Bearer fake-token");
      
      expect(res.status).toBe(403);
    });

    test("retorna lista de usuarios si es admin", async () => {
      jwt.verify.mockReturnValue({ usuarioId: 1 });
      pool.query.mockResolvedValueOnce({ rows: [{ nombre: "admin" }] });
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, nombre_usuario: "test" }] });

      const res = await request(buildApp())
        .get("/usuarios")
        .set("Authorization", "Bearer fake-token");
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe("PUT /usuarios/:id", () => {
    test("un paciente no puede actualizar a otro usuario", async () => {
      jwt.verify.mockReturnValue({ usuarioId: 2 });
      pool.query.mockResolvedValueOnce({ rows: [{ nombre: "paciente" }] });

      const res = await request(buildApp())
        .put("/usuarios/3")
        .set("Authorization", "Bearer fake-token")
        .send({ correo: "nuevo@test.cl" });
      
      expect(res.status).toBe(403);
    });

    test("un admin puede actualizar un usuario", async () => {
      jwt.verify.mockReturnValue({ usuarioId: 1 });
      pool.query.mockResolvedValueOnce({ rows: [{ nombre: "admin" }] });
      pool.query.mockResolvedValueOnce({ rows: [{ id: 2 }] }); 
      pool.query.mockResolvedValueOnce({ rows: [{ id: 2, nombre_usuario: "modificado" }] });
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(buildApp())
        .put("/usuarios/2")
        .set("Authorization", "Bearer fake-token")
        .send({ correo: "nuevo@test.cl" });
      
      expect(res.status).toBe(200);
      expect(res.body.nombre_usuario).toBe("modificado");
    });
  });

  describe("DELETE /usuarios/:id", () => {
    test("elimina un usuario correctamente", async () => {
      jwt.verify.mockReturnValue({ usuarioId: 1 });
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 2 }] }) // Delete
        .mockResolvedValueOnce({ rows: [] }); // Auditoría

      const res = await request(buildApp())
        .delete("/usuarios/2")
        .set("Authorization", "Bearer fake-token");
      
      expect(res.status).toBe(200);
      expect(res.body.deleted).toBe(true);
    });
  });
});
