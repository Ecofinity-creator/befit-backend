// api/send-push.js — Vercel serverless function
// Place this file at: api/send-push.js in your Vercel project
//
// Required environment variables in Vercel dashboard:
//   VAPID_PUBLIC_KEY  = BJoNsaWDe1tjHP5afxOdW7M2iEiQDtDKHJLmlQmsO3Y8EcGI7TVYZX9SyUoJfSUkgInuWEw1DvRxgb_md13xo5M
//   VAPID_PRIVATE_KEY = (your VAPID private key - see instructions below)
//   VAPID_EMAIL       = mailto:info@ecofinity.eu

const webpush = require('web-push');

module.exports = async function handler(req, res) {
  // Allow CORS for your GitHub Pages domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subscription, title, body, tag } = req.body;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Missing subscription' });
  }

  const vapidPublic  = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail   = process.env.VAPID_EMAIL || 'mailto:info@ecofinity.eu';

  if (!vapidPrivate) {
    console.error('VAPID_PRIVATE_KEY not set in environment variables!');
    return res.status(500).json({ error: 'VAPID_PRIVATE_KEY not configured' });
  }

  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

  const payload = JSON.stringify({
    title: title || 'Be Fit Marke',
    body:  body  || '',
    tag:   tag   || 'befit',
    icon:  'https://ecofinity-creator.github.io/befit-app/icon-192.png',
    badge: 'https://ecofinity-creator.github.io/befit-app/icon-192.png',
  });

  try {
    await webpush.sendNotification(subscription, payload);
    console.log('Push sent to:', subscription.endpoint.slice(0, 50));
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Push error:', err.statusCode, err.message);
    // 410 Gone = subscription expired, client needs to re-subscribe
    if (err.statusCode === 410 || err.statusCode === 404) {
      return res.status(410).json({ error: 'Subscription expired', code: err.statusCode });
    }
    return res.status(500).json({ error: err.message, code: err.statusCode });
  }
};
