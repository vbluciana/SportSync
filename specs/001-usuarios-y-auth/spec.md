# Módulo 1: Usuarios, Perfiles y Control de Acceso

## Contexto

SportSync es una PWA orientada a la digitalización de la infraestructura deportiva del Club Empleados Banco Nación Córdoba (CEBNAC), disciplina vóleibol. Este módulo transversal administra la seguridad, el control de acceso basado en roles (RBAC) y el padrón de usuarios institucional. El sistema debe garantizar la seguridad y privacidad de la información de distintos actores institucionales (Coordinadores, Directores Técnicos, Preparadores Físicos y Jugadores).

---

## Usuarios (Roles)

| Rol | Descripción |
|-----|-------------|
| **Coordinador** | Acceso de lectura global al tablero de canchas y al calendario de ambas ramas (Femenina y Masculina). Gestión de usuarios (excepto alta de jugadores). |
| **Director Técnico (DT)** | Reserva y liberación de canchas únicamente para las categorías y ramas que tiene asignadas. Carga de partidos recibidos por el canal de WhatsApp FCV. Emisión de convocatorias a partidos. Recepción de notificaciones push en el celular. Monitoreo del dashboard de asistencia de su plantel en tiempo real. |
| **Preparador Físico (PF)** | Rol estrictamente de consulta (Lectura). Consulta del tablero de ocupación de canchas y del calendario de partidos para coordinar los trabajos físicos en quincho/gimnasio sin interferir. No posee permisos para reservar canchas ni crear eventos. Recepción de notificaciones push en el celular. |
| **Jugadores** | Consulta del calendario deportivo de su categoría. Recepción de notificaciones push en el celular. Confirmación o declinación de asistencia a partidos. |

---

## Historias de Usuario

1. **US-01**: Como jugador, quiero registrarme en la plataforma ingresando mis datos personales y credenciales de acceso, para obtener mi perfil de jugador y acceder a SportSync.
2. **US-02**: Como usuario del sistema (Coordinador, DT, PF o Jugador), quiero iniciar y cerrar sesión con mis credenciales (email y contraseña), para ingresar a la plataforma y mantener mi sesión abierta en la PWA de forma segura.
3. **US-03**: Como Coordinador, quiero dar de alta, editar, consultar y dar de baja lógica a los integrantes del club (DTs, PFs y Jugadores), para administrar el padrón oficial y controlar qué personas tienen acceso al sistema.
4. **US-04**: Como Director Técnico o Jugador, quiero consultar y actualizar mis datos de perfil, verificando que mi información de contacto sea correcta y validando qué planteles puedo coordinar o acceder.
5. **US-05**: Como Jugador, quiero registrarme de forma autónoma en la plataforma ingresando mis datos personales y credenciales, para acceder a SportSync con mi cuenta y perfil de jugador.

---

## Requisitos Funcionales (notación EARS)

### RF-01: REGISTRO DE USUARIO
CUANDO el jugador completa el formulario de registro con datos personales y credenciales de acceso, ENTONCES el sistema creará la cuenta de Supabase Auth y persistirá el perfil de usuario en la tabla de usuarios con rol 'jugador', campos obligatorios: nombre, apellido, email, rol_sistema, active (default: true), y campos opcionales por rol.

### RF-02: MODIFICACIÓN DE DATOS DE USUARIO
CUANDO el usuario modifica su información de perfil (contacto, categorías asignadas, etc.), ENTONCES el sistema validará que el usuario tenga permiso para operar sobre el recurso (propio perfil o permiso de coordinador) y actualizará los campos modificados, retornando HTTP 200 con el perfil actualizado; si el usuario no tiene permiso, retornará HTTP 403.

### RF-03: BAJA LÓGICA DE USUARIO
CUANDO el coordinador solicita la inhabilitación de una cuenta de usuario, ENTONCES el sistema establecerá el campo `active` en `false` en la tabla de usuarios sin borrar el historial de datos asociados (partidos, asistencias, convicatorias), y retornará HTTP 200; si el usuario no existe, retornará HTTP 404.

### RF-04: CONSULTA DE USUARIOS CON FILTROS
CUANDO el coordinador busca y visualiza el listado de usuarios registrados aplicando filtros (rol, estado active, categoría), ENTONCES el sistema aplicará los filtros especificados y retornará el listado paginado; si no hay usuarios con los filtros aplicados, retornará lista vacía HTTP 200.

### RF-05: REGISTRO DE INTEGRANTE STAFF TÉCNICO
CUANDO el coordinador registra a un nuevo integrante del Staff Técnico asignando rol de Director Técnico o Preparador Físico y credenciales de acceso, ENTONCES el sistema creará la cuenta de Supabase Auth y perfil de usuario con el rol asignado, y retornará HTTP 201; si el rol asignado no es DT ni PF, retornará HTTP 400.

### RF-06: INICIAR SESIÓN
CUANDO el usuario (coordinador, DT, PF o jugador) se autentica con sus credenciales de acceso, ENTONCES el sistema verificará las credenciales contra Supabase Auth y retornará JWT token con la información de usuario (id, email, rol_sistema), y si las credenciales son inválidas, retornará HTTP 401.

### RF-07: CERRAR SESIÓN
CUANDO el usuario decide finalizar la sesión activa, ENTONCES el sistema invalidará el token JWT localmente y en el servidor, y retornará HTTP 200 con estado de éxito.

### RF-08: VALIDACIÓN CONFLICTO HTTP 409
CUANDO se intenta registrar un usuario con email que ya existe en el sistema, ENTONCES el sistema detectará el conflicto y retornará HTTP 409 con mensaje de error apropiado; si el email es único, continuará con el registro normal.

---

## Requisitos No Funcionales

| Código | Descripción |
|--------|-------------|
| **RNF-01**: Desacoplamiento strict | Frontend (React PWA) y backend (Node.js/Express) son proyectos totalmente independientes, comunicándose exclusivamente mediante contratos JSON sobre protocolo HTTPS. |
| **RNF-02**: Arquitectura 3 capas | Código backend estructurado obligatoriamente en: Rutas -> Controladores (validación req/res) -> Servicios (lógica pura y base de datos). |
| **RNF-03**: Seguridad JWT | Toda petición HTTP a rutas protegidas debe incluir el token JWT (Authorization: Bearer). El backend debe utilizar middleware `checkAuth` y `checkRole` para validar el rol del usuario; de lo contrario, debe retornar HTTP 403. |
| **RNF-04**: Row Level Security | Toda persistencia en PostgreSQL se hará vía el SDK `@supabase/supabase-js`. La base de datos mantendrá activada la política RLS como barrera perimetral secundaria contra accesos anónimos. |
| **RNF-05**: Mobile-First | Todas las interfaces se diseñarán bajo el concepto Mobile-First (ancho base táctil de 390px) usando Tailwind CSS. |
| **RNF-06**: Códigos de error HTTP | Uso estricto de códigos 200, 201, 400, 401, 403, 404, 409 y 500 en formato JSON en todas las respuestas. |
| **RNF-07**: Idioma español | Nombres de variables, identificadores y mensajes al usuario final en español. |
| **RNF-08**: PWA Service Worker | El sistema debe implementar Service Workers (`sw.js`) para cachear recursos (App Shell) y proveer tolerancia a intermitencias de red (Offline). |
| **RNF-09**: Tiempo de respuesta API | Los endpoints de auth y notas deben responder en menos de 2 segundos bajo carga normal. |
| **RNF-10**: Idempotencia | Las operaciones de modificación de perfil deben ser idempotentes cuando se envían los mismos datos múltiples veces. |

---

## Casos Límite

| Código | Descripción |
|--------|-------------|
| **CL-01**: Intento de registro con email ya existente | El sistema debe retorn HTTP 409 Conflict con mensaje "El email ya está registrado en el sistema". No debe crear cuenta duplicada. |
| **CL-02**: Usuario no autenticado accede a ruta protegida | El middleware de auth debe retornar HTTP 403 Forbidden con mensaje "Acceso no autorizado - token inválido o ausente". |
| **CL-03**: Usuario sin permiso de coordinator intenta dar de baja a otro usuario | El middleware de rol debe retornar HTTP 403 Forbidden con mensaje "No tiene permiso para realizar esta operación". |
| **CL-04**: DT intenta modificar campos restringidos de su perfil (rol, categoría) | El sistema debe permitir la modificación de campos permisivos pero ignorar/ rechazar la modificación de campos de sistema (rol, categoría) sin permiso adecuado. |
| **CL-05**: Consulta de usuarios sin filtros devuelve todo el plantel | Debe retornar lista paginada completa, no vacía, incluso si no se especifica filtros. |
| **CL-06**: Baja lógica de último coordinador restante | El sistema debe prevenir la inhabilitación del último coordinador activo del club (validación de negocio). |
| **CL-07**: Service Worker falla al registrarse en el navegador | El sistema debe manejar gracefully el caso, mostrando UI informativa pero permitiendo funcionamiento básico sin PWA features. |

## [QA1] Plan de Pruebas de Seguridad RBAC, Tokens y Padrón

| Código | Descripción |
|--------|-------------|
| **QA-01**: Acceso sin token JWT | Endpoints protegidos sin token deben retornar HTTP 403 Forbidden |
| **QA-02**: Token vencido o inválido | Middleware debe detectar y rechazar tokens expirados con HTTP 401 |
| **QA-03**: Elevación de privilegios | Usuario jugador no puede acceder a rutas de coordinador aún modificando su token |
| **QA-04**: Padrón de usuarios | Verificación que el total de usuarios activos coincida con el registro en tabla de usuarios |
| **QA-05**: Baja lógica inconsistente | Usuario dado de baja lógica no puede autenticar (token inválido) |
| **QA-06**: Role no autorizado en token | Token con role inexistente debe ser rechazado por checkRole middleware |
| **QA-07**: Consulta cruzada de planteles | Usuario debe ver solo jugadores de su plantel asignado según rol |

---

## Criterios de Finalización (DoD)

- [ ] **Código compilable**: El backend compila sin errores y el linter pasa sin advertencias de error.
- [ ] **Endpoints con manejo de códigos de error**: Todos los endpoints retornan los códigos HTTP 200, 201, 400, 401, 403, 404, 409 y 500 adecuadamente en formato JSON.
- [ ] **RBAC implementado**: Middleware `checkAuth` y `checkRole` validan explícitamente el rol del usuario antes de procesar cualquier solicitud en rutas protegidas.
- [ ] **Perfiles por rol**: La tabla de usuarios contiene el campo `active` (booleano) y el campo `rol_sistema` con valores válidos (Coordinador, DT, PF, Jugador).
- [ ] **Registro completo**: El endpoint POST /api/auth/register crea tanto la cuenta de Supabase Auth como el registro de perfil en la tabla de usuarios.
- [ ] **PWA compile y renderice sin errores**: La Progressive Web App compila y renderiza sin errores en consola, funciona en modo offline y está optimizada para 390px.
- [ ] **Test de integración**: Los endpoints pasan pruebas de integración con casos límite y manejo correcto de códigos de error.
- [ ] **Sin acoplamiento cliente-servidor**: El frontend y backend permanecen completamente independientes, comunicándose solo mediante contratos JSON sobre HTTPS.