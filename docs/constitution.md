# Constitution - SportSync ("Sistema Web para Entrenadores")

Toda especificación, plan técnico, tarea e implementación generada por el agente debe cumplir estrictamente estos 6 principios innegociables.

1. **Desacoplamiento Estricto (Separation of Concerns):**
   El frontend (React PWA) y el backend (Node.js/Express) son proyectos totalmente independientes. Se comunican de forma exclusiva mediante contratos JSON sobre protocolo HTTPS.

2. **Backend en 3 Capas (Cero SQL en Rutas):**
   Queda estrictamente prohibido escribir lógica de negocio o consultas a la base de datos dentro de los archivos de rutas. El flujo obligatorio es: *Rutas -> Controladores (validación req/res) -> Servicios (lógica pura y base de datos)*.

3. **Paradigma PWA y Mobile-First:**
   Todas las interfaces (Tailwind CSS) se diseñarán bajo el concepto Mobile-First (390px). El sistema debe implementar Service Workers (`sw.js`) para cachear recursos (App Shell) y proveer tolerancia a intermitencias de red (Offline).

4. **Seguridad y Control de Acceso (RBAC):**
   Toda petición HTTP a rutas protegidas debe incluir el token JWT (Authorization: Bearer). El backend debe utilizar un middleware (`checkAuth` / `checkRole`) para validar que el rol del usuario (Coordinador, DT, PF, Jugador) tenga permiso explícito antes de procesar la solicitud; de lo contrario, debe retornar HTTP 403.

5. **Integridad de Datos y Row Level Security (RLS):**
   Toda persistencia en PostgreSQL se hará vía el SDK `@supabase/supabase-js`. La base de datos mantendrá activada la política RLS como barrera perimetral secundaria contra accesos anónimos.

6. **Definición de Hecho (DoD) y Testing Continuo:**
   Ningún código se considera "Terminado" hasta que supere las pruebas de integración de endpoints (con manejo correcto de casos límite y códigos 400, 401, 403, 409), supere el análisis del linter, y la PWA compile y renderice sin errores en consola.