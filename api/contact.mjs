import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { name, company, phone, email, type, details } = req.body || {};
  if (!name || !email || !details) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await resend.emails.send({
      from: 'RVI Utility Website <info@rviutility.co.uk>',
      to: 'rvichindris@gmail.com',
      replyTo: email,
      subject: `New quote request from ${name}${company ? ' (' + company + ')' : ''}`,
      text: `Name: ${name}\nCompany: ${company || 'Not provided'}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nWork type: ${type || 'Not specified'}\n\nDetails:\n${details}`
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
