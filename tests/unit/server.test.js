jest.mock("../../src/server/index", () => {
  return { listen: jest.fn((port, cb) => cb && cb()) };
});

describe("server.js", () => {
  test("inicia el servidor correctamente", () => {
    require("../../src/server/server");
    expect(require("../../src/server/index").listen).toHaveBeenCalled();
  });
});
