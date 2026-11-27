jest.mock("../../src/db", () => ({
  pool: { query: jest.fn(), end: jest.fn() },
}));
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

const request = require("supertest");
const express = require("express");
const { pool } = require("../../src/db");
const rolesRoutes = require("../../src/routes/roles");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/roles", rolesRoutes);
  return app;
}

describe("Rutas de Roles", () => {
  afterAll(async () => await pool.end());
  beforeEach(() => jest.clearAllMocks());

  test("GET /roles lista los roles", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, nombre: "admin" }] });
    const res = await request(buildApp()).get("/roles");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test("POST /roles crea un rol", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 2, nombre: "nuevo" }] }) // Insert
      .mockResolvedValueOnce({ rows: [] }); // Auditoría

    const res = await request(buildApp()).post("/roles").send({ nombre: "nuevo" });
    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe("nuevo");
  });

  test("DELETE /roles/:id elimina un rol", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 3 }] }) // Delete
      .mockResolvedValueOnce({ rows: [] }); // Auditoría

    const res = await request(buildApp()).delete("/roles/3");
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });
});
