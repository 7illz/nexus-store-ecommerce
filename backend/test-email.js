const sendEmail = require('./utils/sendEmail');

const run = async () => {
  await sendEmail({
    email: 'test@example.com',
    subject: 'Test Order Confirmation',
    html: '<h1>Test</h1>'
  });
};

run();
