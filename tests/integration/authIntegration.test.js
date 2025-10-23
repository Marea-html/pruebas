const request = require("supertest");
const app = require("../../src/server/index");

const unique = (p="u") => `${p}.${Date.now()}@example.com`;

describe("Auth", () => {
  it("register 200 y duplicado 409", async () => {
    const email = unique("a");
    let r = await request(app).post("/register").send({
      nombres:"N", apellidos:"A", correo: email, dni:"12345678",
      direccion:"-", telefono:"987654321", contrasena:"Clave12345678"
    });
    expect([200,201]).toContain(r.status);

    r = await request(app).post("/register").send({
      nombres:"N", apellidos:"A", correo: email, dni:"12345678",
      direccion:"-", telefono:"987654321", contrasena:"Clave12345678"
    });
    expect([409,400]).toContain(r.status);
  });

  it("bloquea tras 3 intentos fallidos", async () => {
    const email = unique("b");
    await request(app).post("/register").send({
      nombres:"N", apellidos:"A", correo: email, dni:"12345678",
      direccion:"-", telefono:"987654321", contrasena:"Clave12345678"
    });
    for (let i=0;i<3;i++) {
      await request(app).post("/login").send({ correo: email, contrasena: "mal" });
    }
    const ok = await request(app).post("/login").send({ correo: email, contrasena:"Clave12345678" });
    expect([401,423]).toContain(ok.status);
  });
});
