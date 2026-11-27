const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { pool } = require("../../src/db");

// Importamos SOLO el router, no el app.js completo
const pacientesRouter = require("../../src/routes/pacientes");

// Creamos una app express local para el test
const app = express();
app.use(express.json());
app.use("/pacientes", pacientesRouter);

jest.mock("../../src/db", () => ({
  pool: { query: jest.fn() },
}));

const JWT_SECRET = process.env.JWT_SECRET || "inseguro";

describe("Rutas Pacientes - Caminos de error y seguridad", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /pacientes retorna 401 si no se envía token", async () => {
    // Enviamos datos válidos para que Yup pase, pero sin token
    const res = await request(app).post("/pacientes").send({
      rut: "12.345.678-9",
      primer_nombre: "Ana",
      apellido_paterno: "Paz",
      fecha_nacimiento: "1990-01-01",
      sexo: "F",
      email: "ana@test.cl",
    });
    expect(res.status).toBe(401);
  });

  test("GET /pacientes/:id retorna 403 si un paciente intenta ver a otro", async () => {
    // 1. Token de paciente (usuarioId = 1)
    const token = jwt.sign({ usuarioId: 1, rolNombre: "paciente" }, JWT_SECRET);

    // 2. Mockeamos las consultas de la BD
    pool.query
      // Primera consulta: verificar roles del usuario
      .mockResolvedValueOnce({ rows: [{ nombre: "paciente" }] })
      // Segunda consulta: buscar el ID del paciente asociado a ese usuario
      .mockResolvedValueOnce({ rows: [{ id: 1 }] });

    // 3. Pide el paciente con ID 99 (no es el suyo)
    const res = await request(app)
      .get("/pacientes/99")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.glosa).toBe("Solo puede ver sus propios datos");
  });
});
