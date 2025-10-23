// pruebas/tests/integration/registerIntegration.test.js
const request = require("supertest");
const app = require("../../src/server/index");

// helper para generar correos únicos y evitar 409 al re-ejecutar
const uniqueEmail = (pfx = "juan") => `${pfx}.${Date.now()}@example.com`;

describe("POST /register", () => {
  it("debe registrar un usuario válido", async () => {
    const res = await request(app)
      .post("/register")
      .send({
        nombres: "Juan",
        apellidos: "Pérez",
        correo: uniqueEmail("juan"),
        dni: "12345678",
        direccion: "Av. Siempre Viva 123",
        telefono: "987654321",
        contrasena: "clave12345678",
      });

    expect(res.statusCode).toBe(200);                 // tu test original
    expect(res.text).toBe("✅ Registro exitoso!");
  });

  it("debe rechazar un teléfono corto", async () => {
    const res = await request(app)
      .post("/register")
      .send({
        nombres: "Juan",
        apellidos: "Pérez",
        correo: uniqueEmail("juan2"),
        dni: "12345678",
        direccion: "Av. Siempre Viva 123",
        telefono: "1234", // inválido
        contrasena: "clave12345678",
      });

    expect(res.statusCode).toBe(400);
  });
});

describe("Helmet security headers", () => {
  it("envía cabeceras de seguridad clave", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toMatch(/DENY|SAMEORIGIN/);
    expect(res.headers["content-security-policy"]).toBeDefined();
    expect(res.headers["referrer-policy"]).toBeDefined();
  });
});
