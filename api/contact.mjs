import { Resend } from 'resend';

// Configuration comes from Vercel environment variables (see HANDOVER.md).
// The fallbacks keep the form working until the variables are set.
const resend = new Resend(process.env.RESEND_API_KEY);
const TO = process.env.CONTACT_TO_EMAIL || 'rvichindris@gmail.com';
const FROM = process.env.CONTACT_FROM_EMAIL || 'RVI Utility Website <info@rviutility.co.uk>';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { name, company, phone, email, type, details } = req.body || {};
  if (!name || !email || !details) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    // Resend returns { data, error } rather than throwing on API errors.
    const { error } = await resend.emails.send({
      from: FROM,
      to: TO.split(',').map(s => s.trim()).filter(Boolean),
      replyTo: email,
      subject: `New quote request from ${name}${company ? ' (' + company + ')' : ''}`,
      text: `Name: ${name}\nCompany: ${company || 'Not provided'}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nWork type: ${type || 'Not specified'}\n\nDetails:\n${details}`
    });
    if (error) {
      console.error('Resend error:', error);
      return res.status(502).json({ error: 'Failed to send email' });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
