const app = require('../../src/server/index');
const path = require('path');

describe('GET /', () => {
  it('debe ejecutar res.sendFile (mock)', () => {
    const req = {};
    const res = { sendFile: jest.fn() };

    const route = app._router.stack.find(
      r => r.route && r.route.path === '/' && r.route.methods.get
    );

    route.route.stack[0].handle(req, res);

    expect(res.sendFile).toHaveBeenCalledWith(
      path.join(__dirname, '../../src/client/index.html')
    );
  });
});

