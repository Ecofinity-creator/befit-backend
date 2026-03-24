// api/send-push.js — Vercel serverless function
const webpush = require('web-push');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { subscription, title, body, tag } = req.body;
  if (!subscription || !subscription.endpoint) return res.status(400).json({ error: 'Missing subscription' });

  const vapidPublic  = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail   = process.env.VAPID_EMAIL || 'mailto:info@ecofinity.eu';

  if (!vapidPrivate) {
    console.error('VAPID_PRIVATE_KEY not set!');
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
    await webpush.sendNotification(subscription, payload, {
      urgency: 'high',   // Tells Android to show heads-up popup
      TTL: 60,           // 60 seconds time-to-live
    });
    console.log('Push sent OK to:', subscription.endpoint.slice(0, 60));
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Push error:', err.statusCode, err.message);
    if (err.statusCode === 410 || err.statusCode === 404) {
      return res.status(410).json({ error: 'Subscription expired', code: err.statusCode });
    }
    return res.status(500).json({ error: err.message, code: err.statusCode });
  }
};
