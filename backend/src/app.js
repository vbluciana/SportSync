const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes'); // NUEVO: Importamos las rutas

const app = express();

// Middlewares globales
app.use(express.json());

// Configuración explícita de CORS para desarrollo local
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Endpoint de verificación / Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend SportSync operativo' });
});

app.use('/api/auth', authRoutes); // NUEVO: Le decimos a la app que use las rutas en esa

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});