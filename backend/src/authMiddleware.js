const { supabase } = require('./config/supabaseClient');

const checkAuthAndRole = (rolesPermitidos) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ mensaje: 'No hay token de autenticación' });

      // Validar el token con Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) return res.status(401).json({ mensaje: 'Token inválido' });

      // Buscar el rol del usuario en la base de datos
      const { data: usuarioData, error: dbError } = await supabase
        .from('usuarios')
        .select('rol_id')
        .eq('id_usuario', user.id)
        .single();

      if (dbError || !usuarioData) return res.status(403).json({ mensaje: 'Usuario no encontrado' });

      // Asumiendo que rol_id 1 = Coordinador
      if (!rolesPermitidos.includes(usuarioData.rol_id)) {
        return res.status(403).json({ mensaje: 'Acceso denegado: No tenés permisos' });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(500).json({ mensaje: 'Error verificando permisos' });
    }
  };
};

module.exports = { checkAuthAndRole };