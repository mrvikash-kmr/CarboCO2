import { analyzeUrl } from './scan';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { url1, url2 } = req.body;
    if (!url1 || !url2) {
      res.status(400).json({ error: 'Both URLs are required' });
      return;
    }

    const [site1, site2] = await Promise.all([analyzeUrl(url1), analyzeUrl(url2)]);
    res.status(200).json({ site1, site2 });
  } catch (error: any) {
    console.error('Compare Error', error.message || error);
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to compare websites.';
    res.status(500).json({ error: `Comparison failed: ${errorMessage}` });
  }
}
