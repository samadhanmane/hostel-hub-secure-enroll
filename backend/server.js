// Entry point for backend server

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dropdowns', require('./routes/dropdowns'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/fee', require('./routes/fee'));
app.use('/api/payment', require('./routes/payment'));

// Placeholder route
app.get('/', (req, res) => {
  res.send('Hostel Hub Secure Enroll Backend Running');
});

// TODO: Add routes for auth, admin, user, payment, etc.

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
