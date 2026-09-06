# AGENTS.md - SportSync ("Sistema Web para Entrenadores")

## 1. El Proyecto
SportSync es una Progressive Web App (PWA) orientada a la digitalización de la infraestructura deportiva, gestión de agenda de partidos y control de asistencias para el Club Empleados Banco Nación Córdoba (CEBNAC), enfocado en la disciplina de Vóleibol[cite: 5].

## 2. Arquitectura y Tecnologías
- **Estilo:** Arquitectura Cliente-Servidor Desacoplada[cite: 4].
- **Frontend (Cliente):** React.js 18, Vite, Tailwind CSS, Lucide React, vite-plugin-pwa (Vercel)[cite: 4].
- **Backend (API REST):** Node.js (v18+), Express.js (Render)[cite: 4].
- **Base de Datos y Autenticación:** PostgreSQL gestionado en Supabase, Supabase Auth (JWT), SDK `@supabase/supabase-js`[cite: 4].
- **Notificaciones:** web-push (Node.js) para alertas nativas[cite: 4].

## 3. Comandos Principales
- **Backend:** `npm run dev` (carpeta `/server`).
- **Frontend:** `npm run dev` (carpeta `/client`).
- **Testing:** `npm test` (para validación automatizada) y Postman para pruebas manuales de integración de endpoints[cite: 4].

## 4. Estilos y Convenciones
- **Diseño UI:** Enfoque estricto Mobile-First, optimizado para un ancho base táctil de 390px[cite: 4].
- **Backend:** Código estructurado obligatoriamente en 3 capas: Rutas (routes) -> Controladores (controllers) -> Servicios (services)[cite: 4].
- **Respuestas HTTP:** Uso estricto de códigos 200, 201, 400, 401, 403, 404, 409 y 500 en formato JSON[cite: 4].
- **Idioma:** Nombres de variables, identificadores y mensajes al usuario final en español.

## 5. Reglas y Límites
- **Normas Principales:** Las reglas innegociables residen en `docs/constitution.md`.
- **Límites de IA:** 
  - NO acoplar el cliente con el servidor[cite: 4].
  - NO escribir lógica de base de datos en los archivos de rutas[cite: 4].
  - NO exponer secretos; usar siempre el archivo `.env`[cite: 4].

## 6. Verificación al Terminar
Al finalizar cualquier tarea, valida la Definición de Hecho (DoD): el código debe compilar sin errores (linter), los endpoints deben manejar los códigos de error HTTP, y la UI debe ser responsive en dispositivos móviles[cite: 3, 4].