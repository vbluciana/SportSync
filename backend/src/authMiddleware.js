const { supabase } = require('./config/supabaseClient');

const ROLE_NAMES = {
  1: 'COORDINADOR',
  2: 'DT',
  3: 'PF',
  4: 'JUGADOR'
};

const unauthorized = (res, mensaje = 'Token inválido o ausente') => {
  return res.status(401).json({ status: 'error', mensaje });
};

const createAuthMiddleware = (supabaseClient) => async (req, res, next) => {
  const authorization = req.headers.authorization;
  const match = /^Bearer\s+([^\s]+)$/i.exec(authorization || '');

  if (!match) return unauthorized(res);

  try {
    const { data, error } = await supabaseClient.auth.getUser(match[1]);
    if (error || !data.user) return unauthorized(res);

    const { data: profile, error: profileError } = await supabaseClient
      .from('usuarios')
      .select('id_usuario, nombre, apellido, email, rol_id, estado_activo')
      .eq('id_usuario', data.user.id)
      .maybeSingle();

    if (profileError) return res.status(500).json({ status: 'error', mensaje: 'Error obteniendo el perfil del usuario' });
    if (!profile || profile.estado_activo === false) {
      return res.status(403).json({ status: 'error', mensaje: 'Usuario no autorizado' });
    }

    req.user = {
      ...data.user,
      ...profile,
      rol: ROLE_NAMES[profile.rol_id] || 'SIN_ROL'
    };
    return next();
  } catch (error) {
    return res.status(500).json({ status: 'error', mensaje: 'Error verificando la autenticación' });
  }
};

const authMiddleware = createAuthMiddleware(supabase);

const roleMiddleware = (rolesPermitidos = []) => {
  const allowedRoles = rolesPermitidos.map((role) => {
    const normalizedRole = String(role).trim().toUpperCase();
    return ROLE_NAMES[normalizedRole] || normalizedRole;
  });

  return (req, res, next) => {
    if (!req.user) return unauthorized(res);

    const userRoleId = String(req.user.rol_id);
    const userRoleName = String(req.user.rol || ROLE_NAMES[userRoleId] || '').toUpperCase();
    if (!allowedRoles.includes(userRoleId) && !allowedRoles.includes(userRoleName)) {
      return res.status(403).json({ status: 'error', mensaje: 'Acceso denegado: permisos insuficientes' });
    }

    return next();
  };
};

const checkAuthAndRole = (rolesPermitidos) => (req, res, next) => {
  return authMiddleware(req, res, () => roleMiddleware(rolesPermitidos)(req, res, next));
};

module.exports = { authMiddleware, roleMiddleware, checkAuthAndRole, createAuthMiddleware };