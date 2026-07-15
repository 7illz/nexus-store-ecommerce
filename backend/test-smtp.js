const nodemailer = require('nodemailer');

const runTest = async () => {
  const user = 'n7259390@gmail.com';
  const pass = 'ghbryexaeyufeocg';
  
  console.log(`Testing SMTP with user: ${user}`);
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"NexusStore Test" <${user}>`,
      to: user, 
      subject: 'Test Email',
      html: '<p>This is a test email.</p>',
    });
    console.log('✅ Email sent successfully!');
    console.log(info.response);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to send email:');
    console.error(err.message);
    if (err.response) {
       console.error(err.response);
    }
    process.exit(1);
  }
};

runTest();
