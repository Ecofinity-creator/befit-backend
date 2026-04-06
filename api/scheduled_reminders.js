// api/scheduled-reminders.js
// Wordt door de client aangeroepen bij app-open
// Stuurt alle gemiste push-herinneringen voor vandaag

const webpush = require('web-push');

const VAPID_PUBLIC  = 'BEAyf-GldiNn5xkuXFFl6dLqaICQii6aQS7PWDHw-eU6rxI2Zc9-_RtvtzXzzIo2X2XAZnOHj7HxLd9YHuBxH_0';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://ecofinity-creator.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!VAPID_PRIVATE) return res.status(500).json({ error: 'VAPID_PRIVATE_KEY not set' });
  webpush.setVapidDetails('mailto:info@ecofinity.eu', VAPID_PUBLIC, VAPID_PRIVATE);

  const { subscription, pending } = req.body;
  // pending = array van {title, body, tag} - reminders die nog niet verstuurd zijn

  if (!subscription || !Array.isArray(pending) || !pending.length) {
    return res.status(200).json({ sent: 0 });
  }

  let sent = 0;
  for (const r of pending) {
    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({ title: r.title, body: r.body, tag: r.tag })
      );
      sent++;
    } catch (err) {
      console.error('Push failed:', r.tag, err.statusCode || err.message);
      if (err.statusCode === 410) break; // Subscription verlopen
    }
  }

  return res.status(200).json({ sent });
};
