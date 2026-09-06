const { supabase: supabaseAdmin } = require('../config/supabaseClient');

const STAFF_ROLE_IDS = [2, 3];
const EDITABLE_ROLE_IDS = [1, 2, 3, 4];

const validateUser = (body, isEditing = false) => {
  const { nombre, apellido, dni, email, telefono, rol_id, password } = body;
  const roleId = Number(rol_id);
  const errors = [];

  if (!isEditing && (!password || password.length < 6)) errors.push('La contraseña debe tener al menos 6 caracteres');
  if (!nombre?.trim() || !/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]{2,40}$/.test(nombre.trim())) errors.push('El nombre solo puede contener letras y tener entre 2 y 40 caracteres');
  if (!apellido?.trim() || !/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]{2,40}$/.test(apellido.trim())) errors.push('El apellido solo puede contener letras y tener entre 2 y 40 caracteres');
  if (!/^\d{7,8}$/.test(String(dni || '').trim())) errors.push('El DNI debe tener entre 7 y 8 dígitos');
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.push('El email no es válido');
  if (!/^\d{10,}$/.test(String(telefono || '').trim())) errors.push('El teléfono debe tener al menos 10 dígitos');
  const validRoles = isEditing ? EDITABLE_ROLE_IDS : STAFF_ROLE_IDS;
  if (!validRoles.includes(roleId)) {
    errors.push(isEditing ? 'El rol no es válido' : 'Solo se pueden registrar directores técnicos o preparadores físicos');
  }

  return { errors, roleId };
};

// GET: Consultar padrón
const getUsers = async (req, res) => {
  try {
    const { search = '', rol = '' } = req.query;
    let query = supabaseAdmin
      .from('usuarios')
      .select('id_usuario, nombre, apellido, dni, email, telefono, rol_id, plantel_id, estado_activo')
      .order('apellido', { ascending: true });

    if (search.trim()) {
      const term = search.trim().replace(/,/g, '');
      query = query.or(`nombre.ilike.%${term}%,apellido.ilike.%${term}%,dni.ilike.%${term}%`);
    }
    if (rol) query = query.eq('rol_id', Number(rol));

    const { data, error } = await query;
    
    if (error) throw error;
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return res.status(500).json({ status: 'error', mensaje: 'Error interno del servidor' });
  }
};

// POST: Alta de usuario
const createUser = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const { password, nombre, apellido, dni, telefono, rol_id } = req.body;
  const { errors, roleId } = validateUser(req.body);
  if (errors.length) return res.status(400).json({ status: 'error', mensaje: errors.join('. ') });

  try {
    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario')
      .eq('email', email)
      .maybeSingle();

    if (existingUserError) throw existingUserError;
    if (existingUser) return res.status(409).json({ status: 'error', mensaje: 'Ya hay una cuenta creada con ese mail' });

    // 1. Crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
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

    // 2. Insertar en nuestra tabla 'usuarios'
    const { data, error } = await supabaseAdmin.from('usuarios').insert([
      { 
        id_usuario: authData.user.id, 
        email, 
        nombre, 
        apellido, 
        dni, 
        telefono, 
        rol_id: roleId,
        estado_activo: true 
      }
    ]);

    if (error) return res.status(400).json({ status: 'error', mensaje: error.message });

    return res.status(201).json({ status: 'success', mensaje: 'Usuario creado exitosamente', data });
  } catch (error) {
    return res.status(500).json({ status: 'error', mensaje: 'Error interno del servidor' });
  }
};

// PUT: Modificar usuario
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { errors, roleId } = validateUser(req.body, true);
  if (errors.length) return res.status(400).json({ status: 'error', mensaje: errors.join('. ') });
  const { nombre, apellido, dni, email, telefono } = req.body;
  const updates = {
    nombre: nombre.trim(), apellido: apellido.trim(), dni: dni.trim(), email: email.trim(),
    telefono: telefono?.trim() || null, rol_id: roleId
  };

  try {
    const { data, error } = await supabaseAdmin.from('usuarios').update(updates).eq('id_usuario', id);
    if (error) return res.status(400).json({ status: 'error', mensaje: error.message });
    return res.status(200).json({ status: 'success', mensaje: 'Usuario actualizado', data });
  } catch (error) {
    return res.status(500).json({ status: 'error', mensaje: 'Error interno del servidor' });
  }
};

// DELETE: Baja lógica
const softDeleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabaseAdmin.from('usuarios').update({ estado_activo: false }).eq('id_usuario', id);
    if (error) return res.status(400).json({ status: 'error', mensaje: error.message });
    return res.status(200).json({ status: 'success', mensaje: 'Usuario inhabilitado correctamente', data });
  } catch (error) {
    return res.status(500).json({ status: 'error', mensaje: 'Error interno del servidor' });
  }
};

const updateOwnProfile = async (req, res) => {
  const { nombre, apellido, dni, email, telefono } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const updates = {
    nombre: String(nombre || '').trim(),
    apellido: String(apellido || '').trim(),
    dni: String(dni || '').trim(),
    email: normalizedEmail,
    telefono: String(telefono || '').trim() || null
  };

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]{2,40}$/.test(updates.nombre) ||
      !/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]{2,40}$/.test(updates.apellido) ||
      !/^\d{7,8}$/.test(updates.dni) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email) ||
      (updates.telefono === null || !/^\d{10,}$/.test(updates.telefono))) {
    return res.status(400).json({ status: 'error', mensaje: 'Los datos del perfil no son válidos' });
  }

  try {
    const { data: duplicate, error: duplicateError } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario')
      .eq('email', normalizedEmail)
      .neq('id_usuario', req.user.id_usuario)
      .maybeSingle();

    if (duplicateError) throw duplicateError;
    if (duplicate) return res.status(409).json({ status: 'error', mensaje: 'El email ya está registrado' });

    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .update(updates)
      .eq('id_usuario', req.user.id_usuario)
      .select('id_usuario, nombre, apellido, dni, email, telefono, rol_id, plantel_id, estado_activo')
      .single();

    if (error) return res.status(400).json({ status: 'error', mensaje: error.message });
    return res.status(200).json({ status: 'success', mensaje: 'Perfil actualizado', usuario: data });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    return res.status(500).json({ status: 'error', mensaje: 'Error interno del servidor' });
  }
};

module.exports = { getUsers, createUser, updateUser, softDeleteUser, updateOwnProfile };