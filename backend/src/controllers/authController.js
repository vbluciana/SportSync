const { supabase, supabaseAuth } = require('../config/supabaseClient');

const PLAYER_ROLE_ID = 4;
const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]{2,40}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerPlayer = async (req, res) => {
  const nombre = String(req.body.nombre || '').trim();
  const apellido = String(req.body.apellido || '').trim();
  const dni = String(req.body.dni || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const telefono = String(req.body.telefono || '').trim();
  const password = String(req.body.password || '');
  const errors = [];

  if (!namePattern.test(nombre)) errors.push('El nombre debe tener entre 2 y 40 caracteres y usar solo letras');
  if (!namePattern.test(apellido)) errors.push('El apellido debe tener entre 2 y 40 caracteres y usar solo letras');
  if (!/^\d{7,8}$/.test(dni)) errors.push('El DNI debe tener entre 7 y 8 dígitos');
  if (!emailPattern.test(email)) errors.push('El email no es válido');
  if (!/^\d{10,}$/.test(telefono)) errors.push('El teléfono debe tener al menos 10 dígitos');
  if (password.length < 6) errors.push('La contraseña debe tener al menos 6 caracteres');

  if (errors.length) return res.status(400).json({ status: 'error', mensaje: errors.join('. ') });

  try {
    const [{ data: existingEmail, error: emailError }, { data: existingDni, error: dniError }] = await Promise.all([
      supabase.from('usuarios').select('id_usuario').eq('email', email).maybeSingle(),
      supabase.from('usuarios').select('id_usuario').eq('dni', dni).maybeSingle()
    ]);

    if (emailError || dniError) throw emailError || dniError;
    if (existingEmail) return res.status(409).json({ status: 'error', mensaje: 'Ya hay una cuenta creada con ese mail' });
    if (existingDni) return res.status(409).json({ status: 'error', mensaje: 'Ya hay una cuenta creada con ese DNI' });

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      const isDuplicateEmail = authError.message?.toLowerCase().includes('already') || authError.message?.toLowerCase().includes('registered');
      return res.status(isDuplicateEmail ? 409 : 400).json({
        status: 'error',
        mensaje: isDuplicateEmail ? 'Ya hay una cuenta creada con ese mail' : authError.message
      });
    }

    const { error: profileError } = await supabase.from('usuarios').insert({
      id_usuario: authData.user.id,
      rol_id: PLAYER_ROLE_ID,
      dni,
      email,
      nombre,
      apellido,
      telefono: telefono || null,
      estado_activo: true
    });

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      if (profileError.code === '23505') {
        return res.status(409).json({ status: 'error', mensaje: 'El email o DNI ya está registrado' });
      }
      return res.status(400).json({ status: 'error', mensaje: profileError.message });
    }

    return res.status(201).json({
      status: 'success',
      mensaje: 'La cuenta se creó con éxito.'
    });
  } catch (error) {
    console.error('Error registrando jugador:', error);
    return res.status(500).json({ status: 'error', mensaje: 'No se pudo crear la cuenta' });
  }
};

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
      4: 'JUGADOR'
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

module.exports = { login, registerPlayer };