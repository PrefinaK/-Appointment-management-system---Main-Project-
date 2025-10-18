const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');
const { sendAppointmentReminder } = require('./utils/emailService');
const Appointment = require('./models/Appointment');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Email reminder cron job (runs every day at 9 AM)
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily appointment reminders...');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  try {
    const appointments = await Appointment.find({
      date: { $gte: tomorrow, $lt: dayAfterTomorrow },
      status: { $in: ['pending', 'confirmed'] },
      reminderSent: false
    }).populate('customer', 'name email');

    for (const appointment of appointments) {
      await sendAppointmentReminder(
        appointment.customer.email,
        appointment.customer.name,
        appointment
      );
      
      appointment.reminderSent = true;
      await appointment.save();
    }

    console.log(`Sent ${appointments.length} appointment reminders`);
  } catch (error) {
    console.error('Error sending reminders:', error);
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});