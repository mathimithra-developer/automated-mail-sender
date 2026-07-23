import 'dotenv/config';

const rawToken = process.env.ZEPTO_API_KEY;
const token = rawToken ? (rawToken.startsWith('Zoho-enczapikey ') ? rawToken.substring(16) : rawToken) : '';
const fromEmail = process.env.ZEPTO_SENDER_EMAIL;
const toEmail = 'dineshkumar.marimuthu@ieyalsolutions.com';

console.log('Sending test email via ZeptoMail...');
console.log('From:', fromEmail);
console.log('To:', toEmail);

const payload = {
  from: { address: fromEmail, name: 'Ownchat Test' },
  to: [{ email_address: { address: toEmail, name: 'Dinesh Kumar' } }],
  subject: 'Test Email from Ownchat & Mail Sender',
  htmlbody: '<h3>Hello!</h3><p>Your ZeptoMail API integration is working successfully! 🎉</p>',
  textbody: 'Hello! Your ZeptoMail API integration is working successfully!',
};

try {
  const res = await fetch('https://api.zeptomail.in/v1.1/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Zoho-enczapikey ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.log('Response Status:', res.status);
  console.log('Response Body:', JSON.stringify(data, null, 2));
} catch (err) {
  console.error('Error sending email:', err);
}
