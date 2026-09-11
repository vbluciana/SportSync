const { supabase, supabaseAuth } = require('../config/supabaseClient');

const JUGADOR_ROL_ID = 4;
const REQUIRED_FIELDS = ['nombre', 'apellido', 'dni', 'email', 'password'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 20;

const validatePassword = (password) => {
  const errors = [];
  if (!password) {
    errors.push('La contraseña es obligatoria');
    return errors;
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`);
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`La contraseña no puede exceder ${PASSWORD_MAX_LENGTH} caracteres`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una minúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }
  return errors;
};

const validateRegistrationPayload = (payload) => {
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    if (!payload[field] || (typeof payload[field] === 'string' && payload[field].trim() === '')) {
      errors.push(`El campo ${field === 'dni' ? 'DNI' : field === 'password' ? 'contraseña' : field} es obligatorio`);
    }
  }

  if (payload.dni) {
    const dniClean = typeof payload.dni === 'string' ? payload.dni.trim() : String(payload.dni);
    if (!/^\d{7,8}$/.test(dniClean)) {
      errors.push('DNI inválido (debe contener entre 7 y 8 dígitos numéricos)');
    }
  }

  if (payload.email && !EMAIL_REGEX.test(payload.email)) {
    errors.push('El formato del email es inválido');
  }

  if (payload.password) {
    const passwordErrors = validatePassword(payload.password);
    errors.push(...passwordErrors);
  }

  return errors;
};

const registerUser = async (payload) => {
  const validationErrors = validateRegistrationPayload(payload);
  if (validationErrors.length > 0) {
    const error = new Error(validationErrors.join('; '));
    error.code = 'VALIDATION_ERROR';
    error.status = 400;
    throw error;
  }

  const { nombre, apellido, dni, email, password, telefono } = payload;

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      nombre,
      apellido,
      dni,
      telefono: telefono || null,
    },
  });

  if (authError) {
    if (
      authError.message.includes('already registered') ||
      authError.message.includes('already exists') ||
      authError.message.includes('duplicate') ||
      authError.status === 422
    ) {
      const error = new Error('El Email ya se encuentra registrado en el sistema');
      error.code = 'DUPLICATE_ENTRY';
      error.status = 409;
      throw error;
    }
    console.error('[authService] auth.admin.createUser falló:', authError.message);
    const error = new Error('Error al crear el usuario en el sistema de autenticación');
    error.code = 'AUTH_CREATION_ERROR';
    error.status = 500;
    throw error;
  }

  const userId = authData.user.id;

  const usuarioData = {
    id_usuario: userId,
    rol_id: JUGADOR_ROL_ID,
    estado_activo: true,
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    dni: dni.trim(),
    email: email.toLowerCase().trim(),
    telefono: telefono ? telefono.trim() : null,
  };

  const { data: usuario, error: dbError } = await supabase
    .from('usuarios')
    .insert(usuarioData)
    .select()
    .single();

  if (dbError) {
    if (dbError.code === '23505') {
      await supabase.auth.admin.deleteUser(userId);
      let mensaje = 'El Email o DNI ya se encuentra registrado';
      if (dbError.message.includes('email') || dbError.message.includes('usuarios_email_key')) {
        mensaje = 'Ya existe una cuenta registrada con este email';
      } else if (dbError.message.includes('dni') || dbError.message.includes('usuarios_dni_key')) {
        mensaje = 'Ya existe una cuenta registrada con este DNI';
      }
      const error = new Error(mensaje);
      error.code = 'DUPLICATE_ENTRY';
      error.status = 409;
      throw error;
    }

    // Rollback: evitar usuarios huérfanos en Auth sin perfil en DB
    console.error('[authService] DB insert falló, ejecutando rollback:', dbError.code, dbError.message);
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('[authService] CRÍTICO: Rollback falló. Usuario huérfano en Auth:', userId);
    }

    const error = new Error('Error al persistir el perfil del usuario');
    error.code = 'DB_INSERT_ERROR';
    error.status = 500;
    throw error;
  }

  // Protección: edge case donde el INSERT no devuelve datos pero tampoco lanza error
  if (!usuario) {
    console.error('[authService] CRÍTICO: INSERT sin datos y sin error. Ejecutando rollback:', userId);
    await supabase.auth.admin.deleteUser(userId);
    const error = new Error('Error interno al confirmar el registro. Intente nuevamente.');
    error.code = 'INSERT_SILENT_FAIL';
    error.status = 500;
    throw error;
  }

  return {
    id: usuario.id_usuario,
    email: usuario.email,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    dni: usuario.dni,
    telefono: usuario.telefono,
    rol_id: usuario.rol_id,
    estado_activo: usuario.estado_activo,
  };
};

const ROL_MAP = {
  1: 'Coordinador',
  2: 'Director Técnico',
  3: 'Preparador Físico',
  4: 'Jugador',
};

const loginUser = async (email, password) => {
  if (!email || !password) {
    const error = new Error('Email y contraseña son obligatorios');
    error.code = 'VALIDATION_ERROR';
    error.status = 400;
    throw error;
  }

  // supabaseAuth usa persistSession:false para que el JWT del usuario
  // no contamine el cliente admin y no rompa el bypass de RLS en queries de DB.
  const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    const error = new Error('Credenciales inválidas');
    error.code = 'AUTH_ERROR';
    error.status = 401;
    throw error;
  }

  const { data: usuario, error: dbError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id_usuario', authData.user.id)
    .maybeSingle();

  if (dbError || !usuario) {
    console.error('[authService] Perfil no encontrado para auth.user.id:', authData.user.id, dbError?.message);
    const error = new Error('Perfil de usuario no encontrado. Contacte al administrador.');
    error.code = 'PROFILE_NOT_FOUND';
    error.status = 404;
    throw error;
  }

  if (!usuario.estado_activo) {
    const error = new Error('Su cuenta se encuentra inactiva. Contacte al Coordinador.');
    error.code = 'FORBIDDEN';
    error.status = 403;
    throw error;
  }

  return {
    token: authData.session.access_token,
    usuario: {
      id: usuario.id_usuario,
      email: usuario.email,
      rol_id: usuario.rol_id,
      rol: ROL_MAP[usuario.rol_id] || 'Desconocido',
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      plantel_id: usuario.plantel_id,
      categoria: usuario.categoria,
    },
  };
};

module.exports = {
  registerUser,
  loginUser,
  validateRegistrationPayload,
  JUGADOR_ROL_ID,
};