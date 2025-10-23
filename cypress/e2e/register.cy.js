describe("Formulario de Registro", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  it("Muestra error por teléfono corto", () => {
    cy.get("input[name='nombres']").type("Juan");
    cy.get("input[name='apellidos']").type("Perez");
    cy.get("input[name='correo']").type("juan@test.com");
    cy.get("input[name='dni']").type("12345678");
    cy.get("input[name='direccion']").type("Av. Lima 123");
    cy.get("input[name='telefono']").type("1234");
    cy.get("input[name='contrasena']").type("contrasena1234");
    cy.get("button[type='submit']").click();

    cy.contains("El teléfono debe tener al menos 9 dígitos.").should("be.visible");

    // Captura automática
    cy.screenshot("telefono-corto");
  });

  it("Registro exitoso", () => {
    cy.get("input[name='nombres']").type("Maria");
    cy.get("input[name='apellidos']").type("Lopez");
    cy.get("input[name='correo']").type("maria@test.com");
    cy.get("input[name='dni']").type("87654321");
    cy.get("input[name='direccion']").type("Av. Arequipa 789");
    cy.get("input[name='telefono']").type("987654321");
    cy.get("input[name='contrasena']").type("pass123456789");
    cy.get("button[type='submit']").click();

    cy.contains("✅ Registro exitoso!").should("be.visible");
    cy.screenshot("registro-exitoso");
  });
});
