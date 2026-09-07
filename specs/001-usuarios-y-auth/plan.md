# Plan Técnico: Módulo 001 - Usuarios, Autenticación y Seguridad RBAC

## 1. Arquitectura y Stack Tecnológico
* **Frontend (PWA Cliente):** React 18, Vite, Tailwind CSS (enfoque estricto Mobile-First táctil 390px), Axios para consumo HTTP y `vite-plugin-pwa` para el entorno offline.
* **Backend (API REST):** Node.js (v18+), Express.js. Estructurado obligatoriamente en 3 capas: Rutas -> Controladores -> Servicios.
* **Persistencia y Auth:** PostgreSQL gestionado en Supabase, Supabase Auth (JWT) y aplicación de Row Level Security (RLS).

## 2. Decisiones Técnicas y Flujo de Implementación

### 2.1. Gestión de Estado y PWA (Frontend)
* **Contexto Global de Auth:** Se creará un `AuthContext` y un custom hook `useAuth` para proveer de manera global el estado de sesión, el token JWT y el objeto del usuario (incluyendo su rol).
* **Interceptores de Axios:** Para evitar código espagueti y repetición, se configurará un interceptor global que inyecte automáticamente el token (`Authorization: Bearer <token>`) desde el `localStorage` en cada petición saliente. Un segundo interceptor capturará errores `401 Unauthorized` de forma global para ejecutar el cierre de sesión automático y redirigir al login.
* **Protección de Interfaz (Prevención de Doble Clic):** Durante las peticiones asincrónicas (Login y Registro), los botones de acción pasarán a estado `disabled` (mostrando un *spinner*) para prevenir saturación o inserciones múltiples en la base de datos por latencia de red.

### 2.2. Seguridad y Middlewares (Backend)
* **Arquitectura Stateless:** La sesión no se guardará en memoria RAM del servidor. La identidad validada criptográficamente residirá exclusivamente en el JWT.
* **Middleware `checkAuth`:** Validará criptográficamente la firma y expiración del JWT en cada solicitud protegida. Si el token es inválido o no existe, interrumpe el flujo retornando HTTP `401`.
* **Middleware `checkRole`:** Recibirá un array de roles autorizados por ruta y verificará si el rol del payload del JWT tiene los privilegios necesarios. Si el usuario intenta una operación ajena a su rol, interrumpe retornando HTTP `403`.
* **Asignación Inmutable (Fail-Fast):** En la ruta de auto-registro (US1.5), el controlador ignorará cualquier intento de inyección de rol enviado en el body (ej. `{ "rol": "Coordinador" }`) y el servicio forzará inmutablemente la creación del perfil con el ID correspondiente al rol `JUGADOR`.

### 2.3. Persistencia de Datos (Supabase)
* **Transaccionalidad del Alta:** La creación de cuentas (tanto auto-registro como altas del Coordinador) implicará una doble persistencia asincrónica: primero en Supabase Auth (`auth.users`) para generar las credenciales, y luego en la tabla pública `usuarios` para el perfil del club.
* **Baja Lógica:** El endpoint de eliminación no ejecutará un borrado físico. Se actualizará el campo de la base de datos a `active = false` (o `estado = 'inactivo'`) para preservar el historial deportivo.
* **Row Level Security (RLS):** Como barrera perimetral secundaria, se configurarán políticas RLS en la tabla `usuarios` limitando mutaciones críticas.

## 3. Catálogo de Endpoints Involucrados (Contratos JSON)
* `POST /api/auth/register`: Auto-registro público. Asigna el rol `JUGADOR` inmutablemente. Retorna `201 Created` o `409 Conflict` (DNI/Email duplicado).
* `POST /api/auth/login`: Validación de credenciales y emisión de payload + JWT. Retorna `200 OK` o `401 Unauthorized`.
* `GET /api/users`: Listado del padrón con soporte para `?rol=` y `?search=`. Protegido por `checkAuth` y `checkRole(['COORDINADOR'])`.
* `POST /api/users`: Alta administrativa de Staff Técnico (DT/PF). Requiere rol `COORDINADOR`. Retorna `201` o `400`.
* `PUT /api/users/:id`: Edición de datos de contacto o asignación de planteles.
* `DELETE /api/users/:id`: Baja lógica del usuario (inactivación). Requiere rol `COORDINADOR`. Retorna `200 OK`.
* `GET /api/users/profile`: Obtención de datos del usuario activo (información de contacto y categorías asignadas en caso de ser DT).

## 4. Estrategia de Testing (Test-First)
En cumplimiento con los límites de IA y metodologías del proyecto, no se codificará lógica de negocio sin antes haber planificado su prueba de integración:
* **Pruebas de Integración (Express/Supertest):** Todo endpoint debe contar con un test que simule peticiones HTTP reales (ej. comprobando que el registro retorne `409` ante un duplicado).
* **Casos Críticos (Edge Cases) a Testear Obligatoriamente (QA1):**
  1. Petición a ruta protegida sin enviar JWT (`401`).
  2. Petición a ruta administrativa enviando un JWT con rol `JUGADOR` (`403`).
  3. Intento de inyección de rol administrador a través de `POST /api/auth/register` (Verificar que se asigna `JUGADOR`).
  4. Verificación de que `DELETE /api/users/:id` no borra el registro de la BD, sino que actualiza su estado.