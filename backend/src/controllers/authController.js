const { loginUser, registerUser } = require('../services/authService');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await loginUser(email, password);

    return res.status(200).json({
      status: 'success',
      token: result.token,
      usuario: result.usuario,
    });

  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        status: 'error',
        mensaje: error.message,
      });
    }
    console.error('[authController] Error inesperado en login:', error.message);
    return res.status(500).json({ status: 'error', mensaje: 'Error interno del servidor' });
  }
};

const register = async (req, res) => {
  try {
    const usuario = await registerUser(req.body);

    return res.status(201).json({
      status: 'success',
      mensaje: 'Registro exitoso. Bienvenido a SportSync.',
      usuario,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        status: 'error',
        mensaje: error.message,
      });
    }
    console.error('[authController] Error inesperado en registro:', error.message);
    return res.status(500).json({
      status: 'error',
      mensaje: 'Error interno del servidor',
    });
  }
};

module.exports = { login, register };