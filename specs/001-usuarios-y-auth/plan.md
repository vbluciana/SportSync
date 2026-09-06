# Plan Técnico - Módulo 1: Usuarios, Auth y Control de Acceso

## 1. Estructura de Carpetas

### Backend (`/backend/src`)

```
backend/
├── src/
│   ├── config/
│   │   └── supabaseClient.js          ✅ EXISTE - No modificar
│   ├── controllers/
│   │   ├── authController.js          ✅ EXISTE - MODIFICAR (register, logout, me, push-subscription)
│   │   └── usersController.js         🆕 NUEVO - CRUD usuarios + staff técnico
│   ├── middlewares/
│   │   ├── checkAuth.js               🆕 NUEVO - Validación JWT + extracción usuario
│   │   └── checkRole.js               🆕 NUEVO - Validación RBAC por roles permitidos
│   ├── routes/
│   │   ├── authRoutes.js              ✅ EXISTE - MODIFICAR (nuevas rutas /register, /logout, /me, /push-subscription)
│   │   └── usersRoutes.js             🆕 NUEVO - Rutas /api/users protegidas
│   ├── services/
│   │   ├── authService.js             🆕 NUEVO - Lógica Auth (Supabase Auth + trigger usuarios)
│   │   └── usersService.js            🆕 NUEVO - Lógica CRUD usuarios + filtros + RLS
│   ├── utils/
│   │   └── apiResponse.js             🆕 NUEVO - Helper respuestas HTTP estandarizadas
│   └── app.js                         ✅ EXISTE - MODIFICAR (importar usersRoutes, middlewares)
└── tests/
    └── auth.test.js                   🆕 NUEVO - Tests integración (Jest + Supertest + Supabase Local)
    └── jest.config.js                 🆕 NUEVO - Configuración Jest
    └── .env.test                      🆕 NUEVO - Variables de entorno test
```

### Frontend (`/frontend/src`)

```
frontend/
├── src/
│   ├── views/
│   │   ├── LoginView.jsx              ✅ EXISTE - MODIFICAR (link registro, error 409)
│   │   ├── RegisterView.jsx           🆕 NUEVO - Formulario registro jugador (dni, telefono, rol=Jugador)
│   │   ├── PerfilView.jsx             🆕 NUEVO - Ver/editar perfil propio
│   │   └── AdminUsuariosView.jsx      🆕 NUEVO - Solo Coordinador: listado, alta staff, baja lógica
│   ├── hooks/
│   │   ├── useAuth.js                 ✅ EXISTE - MODIFICAR (login, logout, register, me, state global)
│   │   └── useUsers.js                🆕 NUEVO - Hook CRUD usuarios (admin)
│   ├── services/
│   │   ├── api.js                     ✅ EXISTE - No modificar (interceptor JWT OK)
│   │   ├── authService.js             🆕 NUEVO - Llamadas API auth
│   │   └── usersService.js            🆕 NUEVO - Llamadas API users
│   ├── contexts/
│   │   └── AuthContext.jsx            🆕 NUEVO - Context global Auth + RBAC
│   ├── components/
│   │   ├── ProtectedRoute.jsx         🆕 NUEVO - Wrapper rutas por rol
│   │   └── UserForm.jsx               🆕 NUEVO - Formulario reutilizable por rol
│   └── utils/
│       └── roles.js                   🆕 NUEVO - Constantes y helpers roles/permisos
```

---

## 2. Modelo de Datos (Schema Real - `docs/schema.md`)

### Tabla `usuarios` (ya existe en Supabase)

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id_usuario` | UUID | PK | Vinculado 1:1 a `auth.users.id` |
| `rol_id` | INT2 | FK → `roles.id_rol` | Rol via tabla maestra |
| `plantel_id` | INT4 | FK → `planteles.id_plantel`, Nullable | Plantel asignado (categoría+rama+temporada) |
| `dni` | VARCHAR | UNIQUE, NOT NULL | Documento - **requerido en registro** |
| `email` | VARCHAR | UNIQUE, NOT NULL | Igual que `auth.users.email` |
| `nombre` | VARCHAR | NOT NULL | |
| `apellido` | VARCHAR | NOT NULL | |
| `telefono` | VARCHAR | Nullable | |
| `fecha_creacion` | TIMESTAMPTZ | | |
| `estado_activo` | BOOL | Nullable | Soft delete: `true`=activo, `false`=baja lógica |
| `categoria` | TEXT | Nullable | Legacy - texto libre |

### Tablas relacionadas (ya existen)

- **`roles`**: `id_rol` (PK), `nombre` (Unique: 'Coordinador','DT','PF','Jugador')
- **`planteles`**: `id_plantel`, `categoria_id` (FK), `rama_id` (FK), `dt_id` (FK users), `temporada`
- **`categorias`**: `id_categoria`, `nombre`
- **`ramas`**: `id_rama`, `nombre` ('Femenina','Masculina')
- **`suscripciones_push`**: Ya existe para Web Push (endpoint, p256dh, auth)

### Políticas RLS (activadas en Supabase)

- **SELECT**: Coordinador ve todos. DT/PF ven su plantel + propio. Jugador ve solo propio.
- **INSERT**: Solo service role (trigger Auth) o Coordinador.
- **UPDATE**: Propio perfil (campos permitidos) o Coordinador (todos).
- **DELETE**: No permitido (solo `estado_activo = false`).

---

## 3. Contratos de API

### Autenticación (`/api/auth`)

| Método | Endpoint | Middleware | Descripción | Códigos |
|--------|----------|------------|-------------|---------|
| POST | `/api/auth/login` | - | Login email/password → JWT + user data | 200, 400, 401, 500 |
| POST | `/api/auth/register` | - | Registro jugador → Supabase Auth + trigger crea usuario | 201, 400, 409, 500 |
| POST | `/api/auth/logout` | `checkAuth` | Logout (stateless, solo limpia cliente) | 200, 401 |
| GET | `/api/auth/me` | `checkAuth` | Perfil usuario autenticado | 200, 401 |
| POST | `/api/auth/push-subscription` | `checkAuth` | Guardar suscripción Web Push en `suscripciones_push` | 201, 400, 401 |

### Usuarios - Protegidos (`/api/users`)

| Método | Endpoint | Middleware | Descripción | Códigos |
|--------|----------|------------|-------------|---------|
| GET | `/api/users` | `checkAuth` + `checkRole(['Coordinador'])` | Listar con filtros (rol, estado_activo, plantel) | 200, 401, 403 |
| GET | `/api/users/:id` | `checkAuth` + `checkRole(['Coordinador'])` | Obtener por ID | 200, 401, 403, 404 |
| POST | `/api/users/staff` | `checkAuth` + `checkRole(['Coordinador'])` | Alta DT/PF (crea Auth + usuario) | 201, 400, 401, 403, 409 |
| PATCH | `/api/users/:id` | `checkAuth` + `checkRole(['Coordinador'])` | Editar (Coord: todos; otros: propio campos permitidos) | 200, 400, 401, 403, 404 |
| PATCH | `/api/users/:id/deactivate` | `checkAuth` + `checkRole(['Coordinador'])` | Baja lógica (`estado_activo = false`) | 200, 401, 403, 404 |

**Headers protegidos:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Respuesta estándar:**
```json
// Éxito
{ "status": "success", "data": { ... } }
// Error
{ "status": "error", "mensaje": "string descriptivo" }
```

---

## 4. Estrategia de Testing

### Archivo: `backend/tests/auth.test.js`

**Stack:** Jest + Supertest + **Supabase Local (Docker)**

**Setup:**
```bash
# En backend/
npx supabase init
npx supabase start  # PostgreSQL:54322, Auth:54321, Studio:54323
```

**Variables (`.env.test`):**
```
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=<local_service_key>
SUPABASE_ANON_KEY=<local_anon_key>
JWT_EXPIRY=86400
```

**Casos obligatorios (18 tests):**

| TC | Endpoint | Escenario | Esperado |
|----|----------|-----------|----------|
| 01 | POST /auth/login | Credenciales válidas | 200 + token + user.rol_id |
| 02 | POST /auth/login | Email inexistente | 401 "Credenciales inválidas" |
| 03 | POST /auth/login | Password incorrecto | 401 "Credenciales inválidas" |
| 04 | POST /auth/login | Body vacío | 400 "Email y contraseña obligatorios" |
| 05 | POST /auth/register | Jugador datos válidos (dni, telefono) | 201 + usuario en tabla |
| 06 | POST /auth/register | Email ya registrado | 409 "El email ya está registrado" |
| 07 | POST /auth/register | DNI duplicado | 409 "El DNI ya está registrado" |
| 08 | POST /auth/register | Datos incompletos | 400 campos requeridos |
| 09 | GET /auth/me | Token válido | 200 + datos usuario |
| 10 | GET /auth/me | Sin token | 403 "Token inválido o ausente" |
| 11 | GET /auth/me | Token expirado (24h+) | 401 "Token expirado" |
| 12 | GET /auth/me | Usuario `estado_activo=false` | 401 "Cuenta inhabilitada" |
| 13 | GET /users | Coordinador + token | 200 + lista paginada con JOINs |
| 14 | GET /users | DT (no coordinador) | 403 "No tiene permiso" |
| 15 | POST /users/staff | Coordinador crea DT válido | 201 + usuario creado |
| 16 | POST /users/staff | Coordinador crea rol inválido | 400 "Solo DT o PF permitidos" |
| 17 | PATCH /users/:id/deactivate | Coordinador baja usuario | 200 + estado_activo=false |
| 18 | PATCH /users/:id/deactivate | Baja último coordinador | 409 "No puede dar de baja al último coordinador" |

---

## 5. Decisiones Técnicas

### JWT en Cliente (Frontend)

| Aspecto | Decisión | Justificación |
|---------|----------|---------------|
| **Almacenamiento** | `localStorage` (token + user object) | Persistencia PWA offline, arquitectura desacoplada |
| **Interceptor** | `api.js` existente inyecta `Bearer <token>` | Centralizado, automático |
| **Expiración** | **24hs (86400s)** configurado en Supabase Dashboard | UX móvil estándar; refresh_token 30d automático |
| **Logout** | `localStorage.clear()` + AuthContext. Backend responde 200 | Stateless; blocklist futuro si necesario |
| **Roles cliente** | `usuario.rol_id` + `roles.nombre` en AuthContext. `ProtectedRoute` valida | UI reactiva; backend fuente verdad (`checkRole`) |

### Service Worker & Web Push

| Aspecto | Decisión | Justificación |
|---------|----------|---------------|
| **Registro SW** | `vite-plugin-pwa` genera `sw.js` auto. Registro en `main.jsx` | Zero-config, App Shell cacheado |
| **Cache Strategy** | `precacheManifest` (assets) + `networkFirst` (API) | Offline-first shell; datos frescos online |
| **Push Infra** | **Módulo 1**: `POST /api/auth/push-subscription` guarda en `suscripciones_push` (ya existe). Envío real con `web-push` en módulo Partidos. | Desacoplar infra de negocio |
| **Permisos Push** | Solicitar en `PerfilView` o post-login (no bloquear login) | Mejor opt-in |
| **VAPID Keys** | `web-push generate-vapid-keys` → `VAPID_PUBLIC_KEY` (frontend `.env`) + `VAPID_PRIVATE_KEY` (backend `.env`) | Estándar RFC 8030 |

### Trigger Supabase Auth → usuarios (Gratis, nativo)

```sql
-- Function SECURITY DEFINER (service role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.usuarios (id_usuario, email, nombre, apellido, rol_id, estado_activo, dni, telefono, categoria)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'apellido',
    (SELECT id_rol FROM roles WHERE nombre = NEW.raw_user_meta_data->>'rol_sistema'),
    TRUE,
    NEW.raw_user_meta_data->>'dni',
    NEW.raw_user_meta_data->>'telefono',
    NULL
  );
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Backend:** `POST /api/auth/register` llama `supabase.auth.admin.createUser({ email, password, user_metadata: { nombre, apellido, rol_sistema, dni, telefono } })`. Trigger hace el resto.

---

## 6. Resumen Archivos a Crear/Modificar

### Backend (13)
| Archivo | Acción |
|---------|--------|
| `src/middlewares/checkAuth.js` | 🆕 Crear |
| `src/middlewares/checkRole.js` | 🆕 Crear |
| `src/services/authService.js` | 🆕 Crear |
| `src/services/usersService.js` | 🆕 Crear |
| `src/controllers/usersController.js` | 🆕 Crear |
| `src/routes/usersRoutes.js` | 🆕 Crear |
| `src/utils/apiResponse.js` | 🆕 Crear |
| `src/controllers/authController.js` | ✏️ Modificar (register, logout, me, push-subscription) |
| `src/routes/authRoutes.js` | ✏️ Modificar (nuevas rutas) |
| `src/app.js` | ✏️ Modificar (importar usersRoutes, middlewares) |
| `tests/auth.test.js` | 🆕 Crear |
| `tests/jest.config.js` | 🆕 Crear |
| `tests/.env.test` | 🆕 Crear |

### Frontend (13)
| Archivo | Acción |
|---------|--------|
| `src/contexts/AuthContext.jsx` | 🆕 Crear |
| `src/hooks/useAuth.js` | ✏️ Modificar (implementar completo) |
| `src/hooks/useUsers.js` | 🆕 Crear |
| `src/services/authService.js` | 🆕 Crear |
| `src/services/usersService.js` | 🆕 Crear |
| `src/views/RegisterView.jsx` | 🆕 Crear |
| `src/views/PerfilView.jsx` | 🆕 Crear |
| `src/views/AdminUsuariosView.jsx` | 🆕 Crear |
| `src/components/ProtectedRoute.jsx` | 🆕 Crear |
| `src/components/UserForm.jsx` | 🆕 Crear |
| `src/utils/roles.js` | 🆕 Crear |
| `src/views/LoginView.jsx` | ✏️ Modificar (link registro, error 409) |
| `src/main.jsx` | ✏️ Modificar (AuthContext Provider, SW register) |

---

## 7. Próximos Pasos

1. **Supabase**: Crear trigger `handle_new_user` en SQL Editor + verificar roles seedados
2. **Backend**: Instalar `jest`, `supertest`, `@supabase/supabase-cli` (dev). Configurar `npx supabase start`
3. **Frontend**: Verificar `vite-plugin-pwa` config para SW registration
4. **Implementar** en orden: middlewares → services → controllers → routes → tests → frontend