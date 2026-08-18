export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, email, interest, message = '', company = '' } = req.body || {};

    // Honeypot: silently accept bot submissions without sending email.
    if (company) return res.status(200).json({ ok: true });

    if (!name || !phone || !email || !interest) {
      return res.status(400).json({ error: 'Please complete all required fields.' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(String(email))) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO;
    const from = process.env.CONTACT_FROM || 'Margalla Enclave Website <onboarding@resend.dev>';

    if (!apiKey || !to) {
      console.error('Missing RESEND_API_KEY or CONTACT_TO');
      return res.status(500).json({ error: 'Contact service is not configured.' });
    }

    const safe = (v) => String(v ?? '').replace(/[<>]/g, '');
    const subject = `New Margalla Enclave enquiry - ${safe(interest)}`;
    const text = [
      'New website enquiry',
      '',
      `Name: ${safe(name)}`,
      `Phone / WhatsApp: ${safe(phone)}`,
      `Email: ${safe(email)}`,
      `Area of interest: ${safe(interest)}`,
      '',
      'Message:',
      safe(message) || '(none)'
    ].join('\n');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: safe(email),
        subject,
        text
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Resend error:', response.status, detail);
      return res.status(502).json({ error: 'Email service failed.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
}
