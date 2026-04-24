import { analyzeUrl } from './scan';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    const result = await analyzeUrl(url);
    res.status(200).json({ id: Date.now().toString(), ...result });
  } catch (error: any) {
    console.error('Analyze Error', error.message || error);
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to analyze website performance. Please try again later.';
    res.status(500).json({ error: `Analysis failed: ${errorMessage}` });
  }
}
