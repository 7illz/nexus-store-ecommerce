const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    let transporter;

    // Check if the user has provided real Gmail credentials in the .env file
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      // Fallback to Ethereal email for testing if no credentials are provided
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    // Define the email options
    const mailOptions = {
      from: '"NexusStore Team" <support@nexusstore.com>', // You can change this to your store name
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log("----------------------------------------");
    console.log("📧 EMAIL SENT SUCCESSFULLY!");
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log("✅ Sent via Real Gmail Integration");
    } else {
      console.log(`👀 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    console.log("----------------------------------------");

  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
