// api/register.js — Vercel serverless function
// Ontvangt push-abonnementen van clients en bewaart ze server-side
// (Als extra vangnet naast de Firestore-opslag in de app zelf)

const subscriptions = {}; // In-memory (of gebruik een DB voor persistentie)

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://ecofinity-creator.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, subscription } = req.body;
  if (!email || !subscription) {
    return res.status(400).json({ error: 'Missing email or subscription' });
  }

  // Sla het abonnement op (in productie: gebruik een database)
  subscriptions[email] = { subscription, updatedAt: Date.now() };
  console.log('Push subscription registered for:', email);

  return res.status(200).json({ ok: true, email });
};
