const { validateRegister } = require("../../src/server/validationRegister");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("Middleware validateRegister", () => {
  beforeEach(() => {
    mockNext.mockClear();
  });

  test("rechaza si falta un campo obligatorio", () => {
    const req = { body: { nombres: "Ana" } };
    const res = mockResponse();

    validateRegister(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Todos los campos son obligatorios.");
  });

  test("rechaza formato de correo inválido", () => {
    const req = {
      body: {
        nombres: "Ana",
        apellidos: "Gomez",
        correo: "ana.com",
        dni: "12345678",
        direccion: "Calle 1",
        telefono: "987654321",
        contrasena: "password12345"
      }
    };
    const res = mockResponse();

    validateRegister(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Formato de correo inválido.");
  });

  test("rechaza DNI con longitud incorrecta", () => {
    const req = {
      body: {
        nombres: "Ana",
        apellidos: "Gomez",
        correo: "ana@mail.com",
        dni: "12345",
        direccion: "Calle 1",
        telefono: "987654321",
        contrasena: "password12345"
      }
    };
    const res = mockResponse();

    validateRegister(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("El DNI debe tener 8 dígitos.");
  });

  test("rechaza teléfono corto", () => {
    const req = {
      body: {
        nombres: "Ana",
        apellidos: "Gomez",
        correo: "ana@mail.com",
        dni: "12345678",
        direccion: "Calle 1",
        telefono: "123",
        contrasena: "password12345"
      }
    };
    const res = mockResponse();

    validateRegister(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("El teléfono debe tener al menos 9 dígitos.");
  });

  test("rechaza contraseña débil", () => {
    const req = {
      body: {
        nombres: "Ana",
        apellidos: "Gomez",
        correo: "ana@mail.com",
        dni: "12345678",
        direccion: "Calle 1",
        telefono: "987654321",
        contrasena: "abc" // débil
      }
    };
    const res = mockResponse();

    validateRegister(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      "La contraseña debe tener al menos 12 caracteres e incluir letras y números."
    );
  });

  test("acepta datos válidos y ejecuta next()", () => {
    const req = {
      body: {
        nombres: "Ana",
        apellidos: "Gomez",
        correo: "ana@mail.com",
        dni: "12345678",
        direccion: "Calle 1",
        telefono: "987654321",
        contrasena: "password12345"
      }
    };
    const res = mockResponse();

    validateRegister(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});

