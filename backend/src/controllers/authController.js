const { supabase } = require('../config/supabaseClient');

const login = async (req, res) => {
  // 1. Extraemos los datos que nos manda el frontend
  const { email, password } = req.body;

  // LOG 1: Ver qué datos exactos envió el Frontend
  console.log('--- INTENTO DE LOGIN ---');
  console.log('Email recibido:', `"${email}"`);
  console.log('Password recibido (longitud):', password ? password.length : 0);

  // 2. Validación Fail-Fast: Si el usuario no mandó email o contraseña, cortamos acá.
  if (!email || !password) {
    return res.status(400).json({ status: 'error', mensaje: 'Email y contraseña son obligatorios' });
  }

  try {
    // 3. Le pedimos a Supabase que intente iniciar sesión con esos datos
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    // 4. Si Supabase devuelve un error (ej. contraseña mal), respondemos con error 401.
    if (error) {
      return res.status(401).json({ status: 'error', mensaje: 'Credenciales inválidas' });
    }

    // LOG 2: Ver la respuesta exacta del motor de Supabase
    if (error) {
      console.error('Error devuelto por Supabase Auth:', error.message);
      console.error('Código / Status del error:', error.status);
      return res.status(401).json({ status: 'error', mensaje: 'Credenciales inválidas' });
    }

    console.log('Login exitoso en Supabase. ID Usuario:', data.user.id);

    // 5. Si todo salió bien, armamos la respuesta exitosa con el token
    return res.status(200).json({
      status: 'success',
      token: data.session.access_token,
      usuario: {
        id: data.user.id,
        email: data.user.email,
        rol: data.user.user_metadata?.rol_sistema || 'DT'
      }
    });

  } catch (error) {
    console.error('Excepción inesperada en el servidor:', error);
    // 6. Si se cae el servidor o falla algo inesperado, devolvemos error 500
    return res.status(500).json({ status: 'error', mensaje: 'Error interno del servidor' });
  }

};

module.exports = { login };