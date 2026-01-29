// This is a Vercel serverless function to proxy requests to HuggingFace securely.
// Place your HuggingFace API key in the Vercel dashboard as an environment variable named HUGGINGFACE_API_KEY.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'API key not configured' });
    return;
  }

  const { endpoint, body } = req.body;
  if (!endpoint) {
    res.status(400).json({ error: 'Missing endpoint' });
    return;
  }

  try {
    const response = await fetch(`https://router.huggingface.co/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

