const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

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

app.use('/api/auth', authRoutes);

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en el puerto ${PORT}`);
  });
}

module.exports = app;