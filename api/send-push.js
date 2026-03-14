
const webpush = require('web-push');

const VAPID_PUBLIC = 'BJoNsaWDe1tjHP5afxOdW7M2iEiQDtDKHJLmlQmsO3Y8EcGI7TVYZX9SyUoJfSUkgInuWEw1DvRxgb_md13xo5M';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails('mailto:info@be-fit.be', VAPID_PUBLIC, VAPID_PRIVATE);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { subscription, title, body, tag } = req.body;
  const payload = JSON.stringify({ title, body, tag });

  try {
    await webpush.sendNotification(subscription, payload);
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};