const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration data:', req.body);
    
    const { name, email, password, role, phone, businessName } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create user
    const user = new User({
      name,
      email,
      password,
      role: role || 'customer',
      phone: phone || '',
      businessName: businessName || ''
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign({ userId: user._id }, 'your-jwt-secret', { expiresIn: '7d' });
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        businessName: user.businessName
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Login working!' });
});

mongoose.connect('mongodb://localhost:27017/appointment-system')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB error:', err));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});