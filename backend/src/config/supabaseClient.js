const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan las variables de entorno de Supabase en .env');
}

// Cliente ADMIN: usado para operaciones de base de datos y auth.admin.*
// Usa la SERVICE_ROLE_KEY completa. NO tiene persistSession: false porque
// eso rompe auth.admin.createUser en algunas versiones del SDK.
const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente de AUTENTICACIÓN: usado ÚNICAMENTE para signInWithPassword.
// Con persistSession: false su sesión NO contamina el estado interno,
// evitando que las queries de DB posteriores queden sujetas a RLS.
const supabaseAuth = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

module.exports = { supabase, supabaseAuth };