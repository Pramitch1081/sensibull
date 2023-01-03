const cron = require('node-cron');
const nodemailer = require('nodemailer');
// ...

// Create mail transporter.
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    // service: 'gmail',
    secure:true,
    auth: {
      user: 'nikhil.autotech@gmail.com',
      pass: 'yjpydstulzkmddml'
    }
  });

  // ...

// Sending emails every Wednesday.
cron.schedule('14 16 16 * *', function() {
    console.log('---------------------');
    console.log('Running Cron Job');
  
    let messageOptions = {
      from: 'nikhil.autotech@gmail.com',
      to: 'nikhiljivankar007@gmail.com',
      subject: 'Scheduled Email',
      text: 'Hi there. This email was automatically sent by us.'
    };
  
    transporter.sendMail(messageOptions, function(error, info) {
      if (error) {
        throw error;
      } else {
        console.log('Email successfully sent!');
      }
    });
  });