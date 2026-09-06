# Módulo 1: Usuarios, Auth y Control de Acceso - Tasks

## Fase 0: Preparación Base de Datos (Supabase)

- [ ] **T1** - **RF-01, RF-05** - Crear trigger `handle_new_user` en Supabase SQL Editor para sincronizar `auth.users` → `public.usuarios` al registrar.
  Hecho cuando: el trigger se ejecuta correctamente al crear usuario via Supabase Dashboard y persiste fila en `usuarios` con `rol_id` correcto.

- [ ] **T2** - **RF-01, RF-05** - Verificar/seedear tabla `roles` con los 4 roles: Coordinador, DT, PF, Jugador.
  Hecho cuando: `SELECT * FROM roles` retorna 4 filas con `id_rol` y `nombre` correctos.

- [ ] **T3** - **RF-01, RF-05** - Verificar políticas RLS activadas en tabla `usuarios` según spec (SELECT/INSERT/UPDATE/DELETE).
  Hecho cuando: en Supabase Dashboard > Authentication > Policies, las 4 políticas están enabled y coinciden con spec.

---

## Fase 1: Backend - Middlewares y Utilidades

- [ ] **T4** - **RNF-03** - Crear `src/middlewares/checkAuth.js`: middleware que valida JWT Bearer, extrae `user` (id, email, rol_id, estado_activo) y adjunta a `req.user`; retorna 403 si token inválido/ausente, 401 si expirado, 401 si `estado_activo=false`.
  Hecho cuando: test unitario manual con token válido/inválido/expirado retorna códigos esperados.

- [ ] **T5** - **RNF-03** - Crear `src/middlewares/checkRole.js`: factory `checkRole(allowedRoles[])` que valida `req.user.rol_id` contra tabla `roles`; retorna 403 si rol no autorizado.
  Hecho cuando: test unitario con usuario DT intentando acceder a ruta `checkRole(['Coordinador'])` retorna 403.

- [ ] **T6** - **RNF-06** - Crear `src/utils/apiResponse.js`: helpers `success(res, data, status=200)` y `error(res, mensaje, status=400)` que responden formato JSON estándar `{status, data/mensaje}`.
  Hecho cuando: importando y usando en controlador, respuesta en Postman coincide con contrato spec.

---

## Fase 2: Backend - Servicios (Lógica Pura)

- [ ] **T7** - **RF-01, RF-06, RF-08** - Crear `src/services/authService.js`: `registerJugador({nombre, apellido, email, password, dni, telefono})` llama `supabase.auth.admin.createUser` con `user_metadata`; `login(email, password)` valida credenciales y retorna JWT + user; `me(userId)` consulta perfil completo con JOIN roles/planteles; `logout()` placeholder stateless; `savePushSubscription(userId, subscription)`.
  Hecho cuando: funciones exportadas y probadas manualmente contra Supabase Local retornan datos esperados.

- [ ] **T8** - **RF-02, RF-03, RF-04, RF-05** - Crear `src/services/usersService.js`: `listUsers(filtros, pagination)` con filtros rol/estado_activo/plantel; `getUserById(id)`; `createStaff({nombre, apellido, email, password, dni, telefono, rol_sistema})` valida rol DT/PF y llama `supabase.auth.admin.createUser`; `updateUser(id, data, requesterRole, requesterId)` aplica reglas permisos (Coord: todo; propio: campos permitidos); `deactivateUser(id, requesterId)` valida no sea último coordinador y setea `estado_activo=false`.
  Hecho cuando: cada función probada manualmente contra Supabase Local retorna datos y códigos esperados.

---

## Fase 3: Backend - Controladores

- [ ] **T9** - **RF-01, RF-06, RF-07, RF-08** - Modificar `src/controllers/authController.js`: implementar `register(req,res)` (delega a authService.registerJugador, maneja 409 email/DNI), `login(req,res)` (delega a authService.login), `logout(req,res)` (200 OK), `me(req,res)` (delega a authService.me), `pushSubscription(req,res)` (delega a authService.savePushSubscription).
  Hecho cuando: endpoints responden en Postman con contratos spec (200/201/400/401/409).

- [ ] **T10** - **RF-02, RF-03, RF-04, RF-05** - Crear `src/controllers/usersController.js`: `list(req,res)` (filtros query params, paginación), `getById(req,res)`, `createStaff(req,res)` (valida rol DT/PF), `update(req,res)` (valida permisos según requester), `deactivate(req,res)` (valida último coordinador).
  Hecho cuando: endpoints responden en Postman con contratos spec (200/201/400/401/403/404/409).

---

## Fase 4: Backend - Rutas

- [ ] **T11** - **RF-01, RF-06, RF-07, RF-08** - Modificar `src/routes/authRoutes.js`: agregar POST `/register`, POST `/logout`, GET `/me`, POST `/push-subscription`; proteger `/logout`, `/me`, `/push-subscription` con `checkAuth`.
  Hecho cuando: `GET /api/auth/me` sin token retorna 403; con token válido retorna 200 + user.

- [ ] **T12** - **RF-02, RF-03, RF-04, RF-05** - Crear `src/routes/usersRoutes.js`: GET `/` + `checkAuth` + `checkRole(['Coordinador'])`; GET `/:id` + mismo middleware; POST `/staff` + mismo middleware; PATCH `/:id` + mismo middleware; PATCH `/:id/deactivate` + mismo middleware.
  Hecho cuando: DT accediendo a `GET /api/users` retorna 403; Coordinador retorna 200 + lista.

---

## Fase 5: Backend - Integración y Configuración

- [ ] **T13** - **RNF-02** - Modificar `src/app.js`: importar `usersRoutes`, montar en `/api/users`; importar middlewares `checkAuth`, `checkRole` para uso en rutas.
  Hecho cuando: `npm run dev` levanta servidor sin errores y todas las rutas registradas aparecen en logs.

---

## Fase 6: Backend - Testing Automatizado

- [ ] **T14** - **QA-01 a QA-07** - Crear `tests/jest.config.js`: configuración Jest + Supertest, testEnvironment node, setupFilesAfterEnv.
  Hecho cuando: `npm test` ejecuta sin errores de configuración.

- [ ] **T15** - **QA-01 a QA-07** - Crear `tests/.env.test`: variables Supabase Local (URL, SERVICE_ROLE_KEY, ANON_KEY, JWT_EXPIRY).
  Hecho cuando: `npm test` conecta a Supabase Local sin errores de credenciales.

- [ ] **T16** - **QA-01 a QA-07** - Crear `tests/auth.test.js`: implementar 18 tests obligatorios (tabla plan.md líneas 157-176) cubriendo login, register, me, users list, staff create, deactivate, edge cases.
  Hecho cuando: `npm test` ejecuta 18 tests y todos pasan en verde.

---

## Fase 7: Frontend - Utilidades y Contexto

- [ ] **T17** - **RNF-07** - Crear `src/utils/roles.js`: constantes `ROLES = {COORDINADOR: 1, DT: 2, PF: 3, JUGADOR: 4}`, helpers `hasRole(user, allowedRoles)`, `getRoleName(rol_id)`.
  Hecho cuando: importado en componente, `hasRole(user, ['Coordinador'])` retorna boolean correcto.

- [ ] **T18** - **RNF-03, RNF-07** - Crear `src/contexts/AuthContext.jsx`: Provider con state `user`, `token`, `isAuthenticated`; métodos `login`, `logout`, `register`, `me`, `refreshUser`; persistencia `localStorage`; expone `ProtectedRoute` interno.
  Hecho cuando: al loguear, `user` y `token` persisten en localStorage y context expone datos correctos.

---

## Fase 8: Frontend - Hooks y Servicios API

- [ ] **T19** - **RF-01, RF-06, RF-07** - Modificar `src/hooks/useAuth.js`: implementar `login`, `logout`, `register`, `me` llamando a `authService`; manejo estado loading/error; sincroniza con AuthContext.
  Hecho cuando: formulario LoginView llama `login()` y navega a home con user en context.

- [ ] **T20** - **RF-01, RF-08** - Crear `src/services/authService.js`: `login(credentials)`, `register(data)`, `logout()`, `me()`, `savePushSubscription(subscription)` usando `api.js` interceptor.
  Hecho cuando: llamadas en consola devTools muestran request/response correctos contra backend local.

- [ ] **T21** - **RF-02, RF-03, RF-04, RF-05** - Crear `src/hooks/useUsers.js`: `listUsers(filtros)`, `getUser(id)`, `createStaff(data)`, `updateUser(id, data)`, `deactivateUser(id)` llamando a `usersService`.
  Hecho cuando: AdminUsuariosView usa hook y muestra lista, crea staff, edita, desactiva con feedback visual.

- [ ] **T22** - **RF-02, RF-03, RF-04, RF-05** - Crear `src/services/usersService.js`: funciones fetch equivalentes a hooks con manejo errores HTTP 400/401/403/404/409.
  Hecho cuando: hook useUsers integra sin errores y muestra toasts según código respuesta.

---

## Fase 9: Frontend - Componentes Reutilizables

- [ ] **T23** - **RNF-03, RNF-05** - Crear `src/components/ProtectedRoute.jsx`: wrapper que recibe `allowedRoles[]`, lee AuthContext, redirige a `/login` si no autenticado o a `/sin-acceso` si rol no permitido.
  Hecho cuando: ruta `/admin` con `ProtectedRoute allowedRoles={['Coordinador']}` bloquea DT y permite Coordinador.

- [ ] **T24** - **RNF-05, RNF-07** - Crear `src/components/UserForm.jsx`: formulario react-hook-form con campos dinámicos según rol (Jugador: dni, telefono; Staff: rol_sistema select DT/PF); validación DNI único, email único, campos requeridos.
  Hecho cuando: renderizado en RegisterView y AdminUsuariosView muestra campos correctos por rol y valida en submit.

---

## Fase 10: Frontend - Vistas

- [ ] **T25** - **RF-01, RF-05, RF-08** - Crear `src/views/RegisterView.jsx`: formulario registro jugador (nombre, apellido, email, password, dni, telefono); usa UserForm; maneja error 409 email/DNI duplicado; redirige a login tras éxito.
  Hecho cuando: registro exitoso crea usuario en BD y navega a LoginView con toast éxito.

- [ ] **T26** - **RF-02, RF-04** - Crear `src/views/PerfilView.jsx`: muestra datos usuario autenticado (nombre, apellido, email, dni, telefono, rol, plantel); formulario edición campos permisivos (teléfono, etc.); botón logout; integra push subscription opt-in.
  Hecho cuando: usuario edita teléfono, guarda, y cambio persiste en BD y context.

- [ ] **T27** - **RF-03, RF-04, RF-05** - Crear `src/views/AdminUsuariosView.jsx`: solo Coordinador; tabla paginada con filtros (rol, estado_activo, plantel); botón "Nuevo Staff" abre modal UserForm (rol DT/PF); acciones editar/desactivar por fila; confirma baja lógica; valida no desactivar último coordinador.
  Hecho cuando: Coordinador ve lista completa, crea DT, edita usuario, desactiva jugador, y UI refleja cambios sin recargar.

- [ ] **T28** - **RF-06, RF-08** - Modificar `src/views/LoginView.jsx`: agregar link "¿No tienes cuenta? Regístrate" → `/register`; manejar error 409 muestra toast "El email ya está registrado"; error 401 "Credenciales inválidas".
  Hecho cuando: login fallido muestra toast correcto; link registro navega a RegisterView.

---

## Fase 11: Frontend - Integración Principal

- [ ] **T29** - **RNF-03, RNF-08** - Modificar `src/main.jsx`: envolver App con `AuthContext.Provider`; registrar Service Worker `vite-plugin-pwa` (ya configurado); manejar error registro SW gracefully.
  Hecho cuando: `npm run dev` carga app, SW registrado en Application tab, AuthContext disponible en toda la app.

- [ ] **T30** - **RNF-01, RNF-05** - Verificar build producción frontend y backend: `npm run build` en ambos proyectos sin errores; lint pasa; PWA audit Lighthouse > 90.
  Hecho cuando: `npm run build` genera dist sin warnings; `npm run lint` 0 errores; Lighthouse PWA score > 90.

---

## Fase 12: Validación End-to-End

- [ ] **T31** - **DoD completo** - Prueba manual E2E: registrar jugador → login → ver perfil → editar → logout; login coordinador → admin usuarios → crear DT → editar → desactivar → verificar 403 DT en /admin; verificar offline PWA carga shell.
  Hecho cuando: todos los flujos principales funcionan sin errores consola, códigos HTTP correctos, UI responsive 390px.