const validateRegister = (req, res, next) => {
  const { nombres, apellidos, correo, dni, direccion, telefono, contrasena } = req.body;

  // Validar campos vacíos
  if (!nombres || !apellidos || !correo || !dni || !direccion || !telefono || !contrasena) {
    return res.status(400).send('Todos los campos son obligatorios.');
  }

  // Validar correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    return res.status(400).send('Formato de correo inválido.');
  }

  // Validar DNI (8 dígitos exactos)
  if (!/^\d{8}$/.test(dni)) {
    return res.status(400).send('El DNI debe tener 8 dígitos.');
  }

  // Validar teléfono (mínimo 9 dígitos)
  if (!/^\d{9,}$/.test(telefono)) {
    return res.status(400).send('El teléfono debe tener al menos 9 dígitos.');
  }

  // Validar contraseña (mínimo 12 caracteres, letras y números)
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{12,}$/;
  if (!passwordRegex.test(contrasena)) {
    return res.status(400).send('La contraseña debe tener al menos 12 caracteres e incluir letras y números.');
  }

  next();
};

module.exports = { validateRegister };

