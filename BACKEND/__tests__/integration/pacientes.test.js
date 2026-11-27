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
const pacientesRoutes = require("../../src/routes/pacientes");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/pacientes", pacientesRoutes);
  return app;
}

describe("Rutas de Pacientes", () => {
  afterAll(async () => await pool.end());
  beforeEach(() => jest.clearAllMocks());

  describe("POST /pacientes", () => {
    test("retorna 401 si no hay token (incluso con datos válidos)", async () => {
      // Enviamos datos válidos para que Yup pase y podamos evaluar el 401
      const res = await request(buildApp())
        .post("/pacientes")
        .send({
          rut: "12.345.678-9", primer_nombre: "Juan", apellido_paterno: "Perez",
          fecha_nacimiento: "1990-01-01", sexo: "M", email: "juan@test.com"
        });
      expect(res.status).toBe(401);
    });

    test("retorna 400 si los datos son inválidos (yup)", async () => {
      jwt.verify.mockReturnValue({ usuarioId: 1 });
      const res = await request(buildApp())
        .post("/pacientes")
        .set("Authorization", "Bearer fake-token")
        .send({ rut: "invalido" }); 
      expect(res.status).toBe(400);
    });

    test("retorna 403 si el usuario no es medico ni admin", async () => {
      jwt.verify.mockReturnValue({ usuarioId: 2 });
      pool.query.mockResolvedValueOnce({ rows: [{ nombre: "paciente" }] }); 
      
      const res = await request(buildApp())
        .post("/pacientes")
        .set("Authorization", "Bearer fake-token")
        .send({
          rut: "12.345.678-9", primer_nombre: "Juan", apellido_paterno: "Perez",
          fecha_nacimiento: "1990-01-01", sexo: "M", email: "juan@test.com"
        });
      expect(res.status).toBe(403);
    });

    test("crea un paciente correctamente si es medico", async () => {
      jwt.verify.mockReturnValue({ usuarioId: 1 });
      pool.query
        .mockResolvedValueOnce({ rows: [{ nombre: "medico" }] }) 
        .mockResolvedValueOnce({ rows: [{ id: 10, rut: "12345678-9" }] }) 
        .mockResolvedValueOnce({ rows: [] }); 

      const res = await request(buildApp())
        .post("/pacientes")
        .set("Authorization", "Bearer fake-token")
        .send({
          rut: "12.345.678-9", primer_nombre: "Juan", apellido_paterno: "Perez",
          fecha_nacimiento: "1990-01-01", sexo: "M", email: "juan@test.com"
        });
      
      expect(res.status).toBe(201);
      expect(res.body.rut).toBe("12345678-9");
    });
  });

  describe("GET /pacientes/:id", () => {
    test("retorna 403 si un paciente intenta ver a otro", async () => {
      jwt.verify.mockReturnValue({ usuarioId: 5 });
      pool.query.mockResolvedValueOnce({ rows: [{ nombre: "paciente" }] });
      pool.query.mockResolvedValueOnce({ rows: [{ id: 99 }] });

      const res = await request(buildApp())
        .get("/pacientes/100") 
        .set("Authorization", "Bearer fake-token");
      
      expect(res.status).toBe(403);
    });
  });
});
