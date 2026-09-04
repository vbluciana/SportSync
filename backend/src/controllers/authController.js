const { supabase, supabaseAuth } = require('../config/supabaseClient');

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
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email: email,
      password: password,
    });

    // 4. Si Supabase devuelve un error (ej. contraseña mal), respondemos con error 401.
    if (error) {
      console.error('Error de Supabase autenticando:', error.message, 'status:', error.status);
      return res.status(401).json({ status: 'error', mensaje: 'Credenciales inválidas' });
    }

    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('id_usuario, nombre, apellido, email, rol_id, estado_activo')
      .eq('id_usuario', data.user.id)
      .single();

    if (usuarioError || !usuario) {
        console.error('Perfil no encontrado para auth.users.id:', data.user.id);
        console.error('Detalle de consulta a usuarios:', usuarioError?.message || 'La consulta no devolvió filas');
      return res.status(403).json({ status: 'error', mensaje: 'El usuario no tiene un perfil configurado' });
    }

    if (!usuario.estado_activo) {
      return res.status(403).json({ status: 'error', mensaje: 'El usuario está inactivo' });
    }

    const nombresDeRol = {
      1: 'COORDINADOR',
      2: 'DT',
      3: 'PF',
      4: 'JUGADORA'
    };

    console.log('Login exitoso en Supabase. ID Usuario:', data.user.id);

    // 5. Si todo salió bien, armamos la respuesta exitosa con el token
    return res.status(200).json({
      status: 'success',
      token: data.session.access_token,
      usuario: {
        id: usuario.id_usuario,
        email: usuario.email || data.user.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol_id: usuario.rol_id,
        rol: nombresDeRol[usuario.rol_id] || 'SIN_ROL'
      }
    });

  } catch (error) {
    console.error('Excepción inesperada en el servidor:', error);
    // 6. Si se cae el servidor o falla algo inesperado, devolvemos error 500
    return res.status(500).json({ status: 'error', mensaje: 'Error interno del servidor' });
  }

};

module.exports = { login };