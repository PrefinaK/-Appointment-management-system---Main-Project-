const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendAppointmentReminder = async (userEmail, userName, appointmentDetails) => {
  const { service, date, startTime } = appointmentDetails;
  const appointmentDate = new Date(date).toLocaleDateString();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Appointment Reminder',
    html: `
      <h2>Appointment Reminder</h2>
      <p>Dear ${userName},</p>
      <p>This is a reminder of your upcoming appointment:</p>
      <ul>
        <li><strong>Service:</strong> ${service}</li>
        <li><strong>Date:</strong> ${appointmentDate}</li>
        <li><strong>Time:</strong> ${startTime}</li>
      </ul>
      <p>Please arrive 5 minutes early.</p>
      <p>Best regards,<br>Your Business Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Reminder email sent successfully');
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
};

const sendAppointmentConfirmation = async (userEmail, userName, appointmentDetails) => {
  const { service, date, startTime } = appointmentDetails;
  const appointmentDate = new Date(date).toLocaleDateString();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Appointment Confirmation',
    html: `
      <h2>Appointment Confirmed</h2>
      <p>Dear ${userName},</p>
      <p>Your appointment has been confirmed:</p>
      <ul>
        <li><strong>Service:</strong> ${service}</li>
        <li><strong>Date:</strong> ${appointmentDate}</li>
        <li><strong>Time:</strong> ${startTime}</li>
      </ul>
      <p>Thank you for choosing our services!</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};

module.exports = {
  sendAppointmentReminder,
  sendAppointmentConfirmation
};