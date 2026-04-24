import axios from 'axios';

export const analyzeUrl = async (targetUrl: string) => {
  let url = targetUrl;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  const apiKey = process.env.PAGESPEED_API_KEY;
  let apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance`;
  if (apiKey) apiUrl += `&key=${apiKey}`;

  const response = await axios.get(apiUrl);
  const data = response.data;
  const lighthouseResult = data.lighthouseResult;

  if (!lighthouseResult) {
    throw new Error('Failed to fetch performance data.');
  }

  const audits = lighthouseResult.audits;
  const totalByteWeight = audits['total-byte-weight']?.numericValue || 0;
  const networkRequests = audits['network-requests']?.details?.items?.length || 0;
  const loadTime = audits['interactive']?.numericValue || 0;
  const resourceSummary = audits['resource-summary']?.details?.items || [];

  const breakdown = { html: 0, css: 0, js: 0, image: 0, font: 0, other: 0 };
  resourceSummary.forEach((item: any) => {
    const type = item.resourceType;
    const size = item.transferSize || 0;
    if (type === 'Document') breakdown.html += size;
    else if (type === 'Stylesheet') breakdown.css += size;
    else if (type === 'Script') breakdown.js += size;
    else if (type === 'Image' || type === 'Media') breakdown.image += size;
    else if (type === 'Font') breakdown.font += size;
    else breakdown.other += size;
  });

  const sizeGB = totalByteWeight / (1024 * 1024 * 1024);
  const energyKWh = sizeGB * 0.81;
  const co2Grams = energyKWh * 0.475 * 1000;

  const recommendations = [];
  if (totalByteWeight > 2 * 1024 * 1024) {
    recommendations.push({
      type: 'size',
      title: 'Optimize Page Size',
      description: 'Your page size is over 2MB. Actionable steps: 1) Convert images to next-gen formats. 2) Implement lazy loading. 3) Minify CSS/JS. 4) Enable compression.'
    });
  }
  if (networkRequests > 50) {
    recommendations.push({
      type: 'requests',
      title: 'Reduce HTTP Requests',
      description: `You have ${networkRequests} network requests. Actionable steps: 1) Combine files. 2) Use sprites. 3) Inline critical CSS. 4) Remove trackers.`
    });
  }
  if (loadTime > 3000) {
    recommendations.push({
      type: 'time',
      title: 'Improve Load Time',
      description: `Time to interactive is ${(loadTime / 1000).toFixed(1)}s. Actionable steps: 1) Upgrade hosting. 2) Use a CDN. 3) Cache on server.`
    });
  }
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'good',
      title: 'Great Performance',
      description: 'Your website is well optimized for a low carbon footprint.'
    });
  }

  return {
    url,
    metrics: {
      pageSizeBytes: totalByteWeight,
      pageSizeMB: totalByteWeight / (1024 * 1024),
      requests: networkRequests,
      loadTimeMs: loadTime,
      loadTimeS: loadTime / 1000
    },
    carbon: {
      energyKWh,
      co2Grams,
      optimizedCo2Grams: co2Grams * 0.8,
      reductionPercentage: 20
    },
    breakdown,
    recommendations
  };
};
