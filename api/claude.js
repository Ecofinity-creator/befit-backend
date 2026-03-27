// api/claude.js — Vercel serverless proxy voor Anthropic API
// De API-sleutel staat als Vercel environment variable ANTHROPIC_API_KEY
// en verlaat nooit de browser van de gebruiker.

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://ecofinity-creator.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set in Vercel environment!');
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  // Stuur de request door naar Anthropic
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':       'application/json',
        'anthropic-version':  '2023-06-01',
        'x-api-key':          apiKey,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic error:', response.status, data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Claude proxy error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
