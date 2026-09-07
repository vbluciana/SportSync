# Módulo 1: Usuarios, Perfiles y Control de Acceso

## Contexto

SportSync es una PWA orientada a la digitalización de la infraestructura deportiva del Club Empleados Banco Nación Córdoba (CEBNAC), enfocada en la disciplina de Vóleibol (Femenino y Masculino). Este módulo transversal administra la seguridad, el control de acceso basado en roles (RBAC) y el padrón de usuarios institucional. El sistema garantiza la seguridad y privacidad de la información de los actores institucionales mediante autenticación JWT y políticas Row Level Security (RLS) en Supabase. 

*Nota de Negocio:* El sistema gestiona exclusivamente a las y los Jugadores; en el caso de deportistas menores, la cuenta es responsabilidad legal del tutor, pero no existe ni debe existir interfaz, entidad ni rol para tutores en la base de datos.
---

## Usuarios (Roles)

| Rol | Descripción |
|-----|-------------|
| **Coordinador** | Acceso de lectura global al tablero de canchas y al calendario. Gestión centralizada del padrón de usuarios (Alta de DTs y PFs, bajas lógicas y modificaciones). |
| **Director Técnico (DT)** | Reserva y liberación de canchas únicamente para las categorías que tiene formalmente asignadas. Carga de partidos oficiales, emisión de convocatorias y visualización de su perfil |
| **Preparador Físico (PF)** | Rol estrictamente de consulta operativa (Lectura). Visualiza la ocupación de canchas y el calendario para coordinar trabajos físicos sin interferir en las reservas |
| **Jugador** | Rol asignado por defecto en el auto-registro público. Consulta del calendario deportivo de su categoría, actualización de perfil personal y confirmación/declinación de asistencia a partidos |

---

## Historias de Usuario

1. **US-01**: Como jugador, quiero registrarme en la plataforma ingresando mis datos personales y credenciales de acceso, para obtener mi perfil de jugador y acceder a SportSync.
2. **US-02**: Como usuario del sistema (Coordinador, DT, PF o Jugador), quiero iniciar y cerrar sesión con mis credenciales (email y contraseña), para ingresar a la plataforma y mantener mi sesión abierta en la PWA de forma segura.
3. **US-03**: Como Coordinador, quiero dar de alta, editar, consultar y dar de baja lógica a los integrantes del club (DTs, PFs y Jugadores), para administrar el padrón oficial y controlar qué personas tienen acceso al sistema.
4. **US-04**: Como Director Técnico o Jugador, quiero consultar y actualizar mis datos de perfil, verificando que mi información de contacto sea correcta y validando qué planteles puedo coordinar o acceder.
5. **US-05**: Como Jugador, quiero registrarme de forma autónoma en la plataforma ingresando mis datos personales y credenciales, para acceder a SportSync con mi cuenta y perfil de jugador.

---

# Módulo 1: Usuarios, Perfiles y Control de Acceso

## Contexto
SportSync es una Progressive Web App (PWA) diseñada para digitalizar y centralizar la infraestructura deportiva del Club Empleados Banco Nación Córdoba (CEBNAC), abarcando la disciplina de **Vóleibol en ambas ramas (Femenina y Masculina)**. Este módulo transversal administra la seguridad, el control de acceso basado en roles (RBAC), el padrón de usuarios institucional y los cimientos de sesión segura mediante Supabase Auth (JWT) y Row Level Security (RLS).

*Nota de Negocio (Responsabilidad de Cuenta):* El sistema gestiona las cuentas de los Jugadores/as. En el caso de deportistas menores de edad, la administración y uso de la cuenta recae bajo la responsabilidad legal de sus tutores, sin crear un rol, interfaz ni entidad independiente en la base de datos.

---

## Usuarios (Roles)

| Rol | Descripción |
|-----|-------------|
| **Coordinador** | Acceso de lectura global al tablero de canchas y calendario de ambas ramas. Gestión centralizada del padrón de usuarios (Alta exclusiva de DTs y PFs, bajas lógicas y modificaciones). |
| **Director Técnico (DT)** | Reserva y liberación de canchas únicamente para las categorías y ramas que tiene asignadas. Carga de partidos oficiales FCV, emisión de convocatorias y consulta de su perfil con planteles asignados. |
| **Preparador Físico (PF)** | Rol estrictamente de consulta operativa (Lectura). Visualiza el tablero de canchas y el calendario multirrama para coordinar trabajos físicos sin interferir en los turnos. |
| **Jugador / Deportista** | Rol asignado por defecto en el auto-registro público. Consulta el calendario de su categoría/rama, gestiona sus datos de contacto y confirma o declina asistencia a partidos oficiales. |

---

## Historias de Usuario (Módulo 1)

* **US1.1:** Como desarrolladora, quiero implementar middlewares en Express y políticas RLS en Supabase para aislar y proteger el acceso a las rutas y datos según el rol del usuario (RBAC).
* **US1.2:** Como usuario del club (Coordinador, DT, PF o Jugador), quiero iniciar y cerrar sesión con mis credenciales (email y contraseña) para ingresar a la plataforma y mantener mi sesión persistente en la PWA.
* **US1.3:** Como Coordinador, quiero dar de alta integrantes del cuerpo técnico (DTs y PFs), editar, consultar con filtros y dar de baja lógica a usuarios para mantener actualizado el padrón del club.
* **US1.4:** Como Director Técnico o Jugador, quiero consultar y actualizar mis datos de perfil, verificando mi información de contacto y validando (en el caso de DT) qué planteles y ramas tengo asignadas.
* **US1.5:** Como Jugador/a (o adulto responsable en menores), quiero auto-registrarme de forma autónoma con mis datos personales y credenciales para acceder a SportSync sin requerir la carga manual del Coordinador.

---

## Requisitos Funcionales (Notación EARS)

### US1.5 - Auto-Registro de Jugadores
* **RF01.1 (Evento):** CUANDO un deportista complete el formulario público de registro, ENTONCES el sistema creará la cuenta en Supabase Auth y persistirá el registro en la tabla `usuarios` forzando en el servidor de forma inmutable el `rol_id` igual a 4, que corresponde al rol `Jugador`.
* **RF01.2 (Excepción):** SI el DNI o Email ya se encuentran registrados en el sistema, ENTONCES el backend abortará la inserción y retornará HTTP `409 Conflict` con un mensaje indicativo.

### US1.3 - Gestión del Padrón por Coordinador
* **RF02.1 (Evento):** CUANDO el Coordinador registre a un integrante del Staff Técnico asignando rol de Director Técnico o Preparador Físico, ENTONCES el sistema creará las credenciales y el perfil asociado retornando HTTP `201 Created`.
* **RF02.2 (Excepción):** SI el Coordinador intenta registrar un usuario con un rol diferente a DT o PF mediante el endpoint administrativo, ENTONCES el sistema rechazará la solicitud con HTTP `400 Bad Request`.
* **RF02.3 (Evento):** CUANDO el Coordinador solicite la eliminación de una cuenta, ENTONCES el sistema ejecutará una baja lógica estableciendo `estado_activo = false` preservando la integridad del historial operativo y retornando HTTP `200 OK`.
* **RF02.4 (Ubicua):** El sistema SIEMPRE permitirá al Coordinador buscar y filtrar el listado de usuarios en tiempo real por rol, estado activo/inactivo y término de búsqueda (nombre o DNI).

### US1.4 - Perfiles y Categorías Asignadas
* **RF03.1 (Evento):** CUANDO un usuario consulte "Mi Perfil", ENTONCES el sistema mostrará sus datos personales y rol institucional.
* **RF03.2 (Evento):** CUANDO un usuario actualice su información personal modificable, ENTONCES el sistema validará que el usuario tenga permiso para operar sobre el recurso y actualizará los campos permitidos retornando HTTP `200 OK`, y si el usuario no tiene permiso, retornará HTTP 403.
* **RF03.3 (Estado):** MIENTRAS el usuario activo tenga rol de Director Técnico, ENTONCES el sistema listará las categorías y ramas (Femenina / Masculina) formalmente asignadas a su cargo.

### US1.2 - Autenticación y Sesión PWA
* **RF04.1 (Evento):** CUANDO el usuario ingrese credenciales válidas en la pantalla de Login, ENTONCES el sistema validará contra Supabase Auth, emitirá el token JWT y lo almacenará de forma persistente en el cliente (`localStorage`).
* **RF04.2 (Excepción):** SI las credenciales son inválidas o la cuenta se encuentra inactiva (`estado_activo = false`), ENTONCES el sistema impedirá el acceso retornando HTTP `401 Unauthorized` y mostrará un mensaje descriptivo en la interfaz.
* **RF04.3 (Evento):** CUANDO el usuario accione "Cerrar Sesión", ENTONCES el sistema purgará el token del almacenamiento local y redirigirá inmediatamente a la vista de Login.

### US1.1 - Seguridad RBAC y RLS
* **RF05.1 (Ubicua):** El sistema SIEMPRE validará la firma y vigencia del JWT en cada petición a rutas protegidas mediante el middleware de Express `checkAuth`.
* **RF05.2 (Ubicua):** El sistema SIEMPRE verificará que el rol del token pertenezca al conjunto de roles autorizados mediante `checkRole` antes de delegar la ejecución al controlador.
* **RF05.3 (Excepción):** SI una petición a un recurso protegido carece de token o éste expiró, ENTONCES el sistema denegará la solicitud con HTTP `401 Unauthorized`.
* **RF05.4 (Excepción):** SI el usuario autenticado intenta ejecutar una operación ajena a sus privilegios, ENTONCES el sistema responderá con HTTP `403 Forbidden`.
* **RF05.5 (Ubicua):** La base de datos en Supabase SIEMPRE mantendrá activas políticas de Row Level Security (RLS) en las tablas de usuarios y categorías como barrera perimetral secundaria.

---

## Requisitos No Funcionales (RNF)

| Código | Descripción |
|--------|-------------|
| **RNF-01** | **Desacoplamiento Estricto:** Frontend (React PWA) y Backend (Node.js/Express) son independientes, comunicándose exclusivamente vía contratos JSON sobre HTTPS. |
| **RNF-02** | **Arquitectura en Capas:** Backend estructurado obligatoriamente en Rutas -> Controladores (validación de I/O) -> Servicios (lógica pura e interacción con Supabase). |
| **RNF-03** | **Seguridad Stateless:** El servidor no almacena sesiones en memoria; la identidad se valida criptográficamente en cada request mediante JWT en el header `Authorization: Bearer <token>`. |
| **RNF-04** | **PWA Mobile-First:** Todas las interfaces del módulo (Login, Auto-registro, Perfil y Padrón) deben estar maquetadas para un ancho táctil base de 390px usando Tailwind CSS. |
| **RNF-05** | **Estandarización HTTP:** Uso estricto de códigos de respuesta 200, 201, 400, 401, 403, 404, 409 y 500 en formato JSON. |
| **RNF-06** | **Tolerancia de Red en Cliente:** La PWA debe interceptar errores de conexión y caídas de red mediante Axios, mostrando estados visuales claros sin quebrar la interfaz. |

---

## Casos Límite (Edge Cases)

| Código | Descripción |
|--------|-------------|
| **CL-01** | **Inyección maliciosa de rol en auto-registro:** Si un payload envía `{ "rol_sistema": "Coordinador" }` en `POST /api/auth/register`, el backend ignorará dicho campo y forzará inmutablemente el rol `JUGADOR`. |
| **CL-02** | **Conflicto de duplicidad (HTTP 409):** Si se intenta registrar un DNI o Email preexistente, el sistema aborta la transacción y responde 409 con mensaje explicativo. |
| **CL-03** | **Usuario inactivo con sesión abierta:** Si un usuario dado de baja lógica intenta realizar una petición con un token no expirado, el middleware o servicio verifica `estado_activo == false` y revoca el acceso con HTTP 401/403. |
| **CL-04** | **Prevención de doble clic:** Los botones de submit en Login y Registro deben inhabilitarse (`disabled`) durante el procesamiento de la petición para prevenir registros duplicados por latencia. |
| **CL-05** | **Protección del último Coordinador:** El sistema debe impedir la baja lógica del único Coordinador activo del club. |

---

## [QA1] Plan de Pruebas de Seguridad RBAC, Tokens y Padrón

| Código | Descripción de la Prueba |
|--------|--------------------------|
| **QA-01** | **Acceso sin Token:** Peticiones a endpoints privados de `/api/users` sin encabezado `Authorization` deben retornar HTTP 401. |
| **QA-02** | **Acceso no Autorizado (RBAC):** Token con rol `Jugador` o `Director Técnico` intentando acceder a la creación/baja de usuarios en `/api/users` debe retornar HTTP 403. |
| **QA-03** | **Persistencia de Sesión:** Tras iniciar sesión, recargar la PWA en el navegador; el estado de autenticación y datos de usuario deben permanecer intactos. |
| **QA-04** | **Integridad de Baja Lógica:** Al ejecutar `DELETE /api/users/:id`, comprobar en la base de datos que el registro persiste con `estado_activo = false` y no se borra físicamente. |
| **QA-05** | **Validación de Unicidad en Registro:** Intentar registrar dos veces el mismo email o DNI en `/api/auth/register` y verificar que el segundo retorne HTTP 409. |

---

## Criterios de Finalización (Definition of Done - DoD)

- [ ] **Código y Peer Review:** Código subido a GitHub en su respectiva rama, con Pull Request enlazado a la US y aprobado por la compañera.
- [ ] **RBAC Operativo:** Middlewares `checkAuth` y `checkRole` aplicados y verificados en todos los endpoints privados del módulo.
- [ ] **Contratos de Error JSON:** Endpoints con manejo exhaustivo de respuestas estándar (200, 201, 400, 401, 403, 404, 409).
- [ ] **Auto-registro probado:** Creación de cuenta en Supabase Auth y persistencia simultánea en la tabla `usuarios` con rol asignado por servidor.
- [ ] **PWA Mobile-First 390px:** Vistas de Login, Auto-registro, Perfil y Padrón probadas en viewport móvil táctil sin desbordes horizontales ni errores en consola.
- [ ] **Plan de Pruebas QA1 Aprobado:** Casos de prueba de seguridad y padrón ejecutados satisfactoriamente.