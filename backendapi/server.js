const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth');
const { seedUsers } = require('./src/seeders/useSeeders');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// Mounting at /api means the router's /login path becomes /api/login
app.use('/api', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Run Seeders (For demo purposes, running on startup)
console.log('Running database seeders...');
seedUsers();

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});