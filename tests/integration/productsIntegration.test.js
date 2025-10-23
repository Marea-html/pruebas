const request = require("supertest");
const app = require("../../src/server/index");

async function token() {
  const email = `p.${Date.now()}@example.com`;
  await request(app).post("/register").send({
    nombres:"N", apellidos:"A", correo: email, dni:"12345678",
    direccion:"-", telefono:"987654321", contrasena:"Clave12345678"
  });
  const r = await request(app).post("/login").send({ correo: email, contrasena:"Clave12345678" });
  return r.body.token;
}

describe("/products", () => {
  it("401 sin token", async () => {
    const r = await request(app).get("/products?category=beauty");
    expect(r.status).toBe(401);
  });

  it("200 con token; category obligatoria", async () => {
    const t = await token();
    const r1 = await request(app).get("/products").set("Authorization", `Bearer ${t}`);
    expect(r1.status).toBe(400); // falta category

    const r2 = await request(app)
      .get("/products?category=beauty")
      .set("Authorization", `Bearer ${t}`);
    expect([200,204]).toContain(r2.status);
    expect(r2.body).toBeDefined();
  });
});
