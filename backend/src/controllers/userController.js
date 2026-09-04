const { supabase: supabaseAdmin } = require('../config/supabaseClient');

const allowedRoles = [1, 2, 3, 4];

const validateUser = (body, isEditing = false) => {
  const { nombre, apellido, dni, email, telefono, rol_id, categoria, password } = body;
  const roleId = Number(rol_id);
  const errors = [];

  if (!isEditing && (!password || password.length < 6)) errors.push('La contraseña debe tener al menos 6 caracteres');
  if (!nombre?.trim()) errors.push('El nombre es obligatorio');
  if (!apellido?.trim()) errors.push('El apellido es obligatorio');
  if (!dni?.trim()) errors.push('El DNI es obligatorio');
  if (!email?.trim() || !/^\S+@\S+\.\S+$/.test(email)) errors.push('El email no es válido');
  if (!allowedRoles.includes(roleId)) errors.push('El rol no es válido');
  if (roleId === 4 && !categoria?.trim()) errors.push('La categoría es obligatoria para jugadoras');

  return { errors, roleId };
};

// GET: Consultar padrón
const getUsers = async (req, res) => {
  try {
    const { search = '', rol = '' } = req.query;
    let query = supabaseAdmin
      .from('usuarios')
      .select('id_usuario, nombre, apellido, dni, email, telefono, rol_id, categoria, estado_activo')
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
  const { email, password, nombre, apellido, dni, telefono, rol_id, categoria } = req.body;
  const { errors, roleId } = validateUser(req.body);
  if (errors.length) return res.status(400).json({ status: 'error', mensaje: errors.join('. ') });

  try {
    // 1. Crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) return res.status(400).json({ status: 'error', mensaje: authError.message });

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
        categoria: roleId === 4 ? categoria.trim() : null,
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
  const { nombre, apellido, dni, email, telefono, categoria } = req.body;
  const updates = {
    nombre: nombre.trim(), apellido: apellido.trim(), dni: dni.trim(), email: email.trim(),
    telefono: telefono?.trim() || null, rol_id: roleId, categoria: roleId === 4 ? categoria.trim() : null
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

module.exports = { getUsers, createUser, updateUser, softDeleteUser };