const { normalizeRut } = require("../../src/utils/rut");

describe("normalizeRut", () => {
  test("elimina puntos del RUT con formato", () => {
    expect(normalizeRut("12.345.678-9")).toBe("12345678-9");
  });
  test("elimina puntos del RUT con K", () => {
    expect(normalizeRut("12.345.678-K")).toBe("12345678-K");
  });
  test("deja intacto un RUT sin puntos", () => {
    expect(normalizeRut("12345678-9")).toBe("12345678-9");
  });
  test("maneja RUT con múltiples puntos", () => {
    expect(normalizeRut("1.2.3.4.5.6.7.8-9")).toBe("12345678-9");
  });
  test("retorna null/undefined si el input es falsy", () => {
    expect(normalizeRut(null)).toBeNull();
    expect(normalizeRut(undefined)).toBeUndefined();
    expect(normalizeRut("")).toBe("");
  });
});
