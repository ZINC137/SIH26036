const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const lmoRoutes = require('./routes/lmo');
const fieldOfficerRoutes = require('./routes/fieldOfficer');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies to be sent
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/lmo', lmoRoutes);
app.use('/api/field-officer', fieldOfficerRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
