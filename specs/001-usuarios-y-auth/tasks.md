# Tareas de Implementación: Módulo 001 - Usuarios y Seguridad

## Bloque A: Tareas A supervisar y validar 

### [US1.1] Middlewares de Autenticación JWT y Seguridad RBAC
- [ ] **T1.1.1 (Base de Datos):** Habilitar Row Level Security (RLS) en las tablas `usuarios` y `categorias` en Supabase [RF05.5].
- [ ] **T1.1.2 (Backend):** Crear `src/middlewares/authMiddleware.js` que valide criptográficamente el JWT del header `Authorization`. Debe retornar HTTP 401 si no existe o expiró [RF05.1, RF05.3].
- [ ] **T1.1.3 (Backend):** Crear `src/middlewares/roleMiddleware.js` que intercepte la petición y valide si el rol del payload pertenece al array de roles permitidos. Debe retornar HTTP 403 en caso contrario [RF05.2, RF05.4].
- [ ] **QA/Verificación (Luciana):** Ejecutar petición a ruta protegida sin token (esperar 401) y con un token de `Jugador` a una ruta de `Coordinador` (esperar 403) [QA-01, QA-02].

### [US1.3] API y Gestión del Padrón (CRUD Coordinador)
- [ ] **T1.3.1 (Backend):** Desarrollar rutas y controladores (`GET`, `POST`, `PUT`) en `/api/users` protegidos por `roleMiddleware(['Coordinador'])` [RF02.1, RF02.2].
- [ ] **T1.3.2 (Backend):** Implementar la lógica del endpoint `DELETE /api/users/:id` ejecutando un borrado lógico (`estado_activo = false`) [RF02.3].
- [ ] **T1.3.3 (Frontend):** Construir vista administrativa del padrón con barra de búsqueda por nombre/DNI y filtros por rol [RF02.4].
- [ ] **QA/Verificación (Luciana):** Verificar en la base de datos que al eliminar un usuario la fila persiste pero cambia su estado a inactivo [QA-04].

---

## Bloque B: Tareas de Desarrollo Directo

### [US1.2] Módulo de Autenticación, Interceptores y PWA
- [ ] **T1.2.1 (Frontend):** Crear contexto global `AuthContext` y custom hook `useAuth` para persistir token y datos del usuario en `localStorage` [RF04.1].
- [ ] **T1.2.2 (Frontend):** Configurar interceptores globales en Axios: inyectar `Bearer <token>` en cada request y capturar errores `401` en los responses para forzar el deslogueo [RF04.2, RNF-06].
- [ ] **T1.2.3 (Frontend):** Diseñar vista `LoginView.jsx` (Mobile-First 390px). Configurar botón de submit en estado `disabled` (spinner) durante la carga para prevenir doble clic [RF04.1, CL-04].
- [ ] **T1.2.4 (Frontend):** Implementar función de Logout, limpiar estado global/local y programar redirección a `/login` [RF04.3].

### [US1.5] Auto-Registro de Jugadores (Fail-Fast)
- [X] **T1.5.1 (Backend/Test):** Escribir prueba de integración con Supertest para validar colisión de datos duplicados y asignación forzada de rol.
- [X] **T1.5.2 (Backend):** Crear controlador para `POST /api/auth/register`. En el servicio, ignorar `req.body.rol` y forzar de manera inmutable la creación del perfil con rol `Jugador` [RF01.1, CL-01].
- [X] **T1.5.3 (Backend):** Implementar captura de error de unicidad en base de datos para Email/DNI, retornando contrato estricto HTTP 409 [RF01.2, CL-02].
- [X] **T1.5.4 (Frontend):** Diseñar vista `RegisterView.jsx` (Mobile-First) con validación de coincidencia de contraseñas y enlace hacia la vista de Login. 
- [X] **QA/Validación:** Intentar registrar dos veces el mismo email y comprobar que la UI capture el HTTP 409 y muestre el mensaje visual [QA-05].

### [US1.4] Gestor de Perfiles y Categorías Asignadas
- [ ] **T1.4.1 (Backend):** Implementar endpoint `GET /api/users/profile`. Si el rol del usuario en el token es `Director Técnico`, incluir un JOIN/consulta a la tabla de planteles para traer las ramas/categorías asignadas [RF03.1, RF03.3].
- [ ] **T1.4.2 (Backend):** Implementar endpoint `PUT /api/users/profile` limitando la actualización únicamente a campos permitidos y retornando 200 OK [RF03.2].
- [ ] **T1.4.3 (Frontend):** Construir vista `ProfileView.jsx`. Aplicar renderizado condicional para listar las categorías únicamente si el usuario activo tiene rol `Director Técnico` [RF03.3].