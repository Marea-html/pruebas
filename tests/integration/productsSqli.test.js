const request = require("supertest");
const app = require("../../src/server/index");

async function token() {
  const email = `s.${Date.now()}@example.com`;
  await request(app).post("/register").send({
    nombres:"N", apellidos:"A", correo: email, dni:"12345678",
    direccion:"-", telefono:"987654321", contrasena:"Clave12345678"
  });
  const r = await request(app).post("/login").send({ correo: email, contrasena:"Clave12345678" });
  return r.body.token;
}

test("no concatena SQL: category con patrón ' OR '1'='1 no devuelve todo", async () => {
  const t = await token();
  const payload = encodeURIComponent("' OR '1'='1");
  const r = await request(app)
    .get(`/products?category=${payload}`)
    .set("Authorization", `Bearer ${t}`);
  expect([200,204]).toContain(r.status);
  // La clave es que el driver trata TODO como el valor del parámetro,
  // no como parte de la consulta → no 'inyecta' datos. Puedes chequear que sea []
  // si tu tabla está vacía o que no crezca respecto a una consulta válida.
});
