import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Leaf, Zap, Globe, Clock, HardDrive, AlertCircle, CheckCircle2, ArrowRight, Download, Scale, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import html2pdf from 'html2pdf.js';
import axios from 'axios';

interface AnalysisResult {
  url: string;
  metrics: {
    pageSizeBytes: number;
    pageSizeMB: number;
    requests: number;
    loadTimeMs: number;
    loadTimeS: number;
  };
  carbon: {
    energyKWh: number;
    co2Grams: number;
    optimizedCo2Grams: number;
    reductionPercentage: number;
  };
  breakdown: {
    html: number;
    css: number;
    js: number;
    image: number;
    font: number;
    other: number;
  };
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
  }>;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

export default function Dashboard() {
  const { firebaseUser } = useAuth();
  const [url, setUrl] = useState('');
  const [compareUrl, setCompareUrl] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [compareResult, setCompareResult] = useState<AnalysisResult | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const qUrl = searchParams.get('url');
    if (qUrl) {
      setUrl(qUrl);
      handleAnalyze(qUrl);
    }
  }, []);

  const handleAnalyze = async (targetUrl: string, isCompare: boolean = false) => {
    if (!targetUrl) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/analyze', { url: targetUrl });
      const data = response.data;
      
      if (!isCompare && firebaseUser) {
        // Save scan to Firestore for current user
        await setDoc(doc(db, 'scans', data.id), {
          userId: firebaseUser.uid,
          url: data.url,
          co2: data.carbon.co2Grams,
          energy: data.carbon.energyKWh,
          page_size: data.metrics.pageSizeBytes,
          load_time: data.metrics.loadTimeMs,
          requests: data.metrics.requests,
          breakdown: data.breakdown,
          recommendations: data.recommendations,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp() // Just to satisfy schema if needed
        });
      }

      if (isCompare) {
        setCompareResult(data);
      } else {
        setResult(data);
        setCompareResult(null); // Reset compare result on new primary analysis
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    
    const opt: any = {
      margin:       0.5,
      filename:     'ESG_Carbon_Footprint_Report.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderResult = (data: AnalysisResult, title: string = "Analysis Results") => {
    const chartData = [
      { name: 'HTML', value: data.breakdown.html },
      { name: 'CSS', value: data.breakdown.css },
      { name: 'JavaScript', value: data.breakdown.js },
      { name: 'Images/Media', value: data.breakdown.image },
      { name: 'Fonts', value: data.breakdown.font },
      { name: 'Other', value: data.breakdown.other },
    ].filter(item => item.value > 0);

    const isHighEmission = data.carbon.co2Grams > 1.0; 
    const emissionColorText = isHighEmission ? 'text-red-600 dark:text-red-500' : 'text-emerald-600 dark:text-emerald-500';
    const emissionBgClass = isHighEmission 
      ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50 ring-1 ring-red-500/20' 
      : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50';

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <span className="text-sm text-muted-foreground font-mono">{data.url}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className={`cursor-help transition-colors ${emissionBgClass}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-sm font-medium ${emissionColorText}`}>Estimated CO2</CardTitle>
                  <Leaf className={`h-4 w-4 ${emissionColorText}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${emissionColorText}`}>
                    {data.carbon.co2Grams.toFixed(2)}g
                  </div>
                  <p className={`text-xs mt-1 font-medium ${isHighEmission ? 'text-red-500/80 dark:text-red-400/80' : 'text-emerald-600/80 dark:text-emerald-500/80'}`}>
                    Per page visit
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-[200px] text-sm">The estimated amount of carbon dioxide emitted every time someone visits this page, calculated based on data transfer size and grid carbon intensity.{isHighEmission ? ' A value > 1.0g is considered high.' : ''}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-help">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Energy Used</CardTitle>
                  <Zap className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data.carbon.energyKWh.toFixed(5)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    kWh per visit
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-[200px] text-sm">The estimated electrical energy consumed by data centers, networks, and end-user devices to load this page.</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-help">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Page Size</CardTitle>
                  <HardDrive className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data.metrics.pageSizeMB.toFixed(2)} MB
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total transfer size
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-[200px] text-sm">The total amount of data transferred over the network to load the page. Smaller is better for both speed and emissions.</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-help">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Load Time</CardTitle>
                  <Clock className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data.metrics.loadTimeS.toFixed(1)}s
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.metrics.requests} HTTP requests
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-[200px] text-sm">The time it takes for the page to become fully interactive. Faster load times improve user experience and reduce device energy usage.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Resource Breakdown</CardTitle>
              <CardDescription>Data transfer by resource type</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: any) => formatBytes(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>Actionable steps to reduce carbon footprint</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                  {rec.type === 'good' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <h4 className="text-sm font-semibold">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                  </div>
                </div>
              ))}

              {data.carbon.reductionPercentage > 0 && (
                <div className="mt-6 p-4 rounded-lg bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Potential Impact</h4>
                      <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
                        Implementing these changes could reduce emissions by ~{data.carbon.reductionPercentage}%.
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                      {data.carbon.optimizedCo2Grams.toFixed(2)}g
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#f5f5f5] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans print:bg-white">
        {/* Header */}
        <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-500 p-2 rounded-lg">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight">EcoMetrics ESG</h1>
            </div>
            {result && (
              <Button variant="outline" size="sm" onClick={handlePrint} className="hidden sm:flex">
                <Download className="h-4 w-4 mr-2" />
                Download PDF Report
              </Button>
            )}
          </div>
        </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Input Section - Hidden when printing */}
        <section className="print:hidden">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Digital Carbon Footprint Analysis</CardTitle>
              <CardDescription>
                Enter a website URL to estimate its carbon emissions based on performance data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="url" className="sr-only">Website URL</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="url" 
                      placeholder="https://example.com" 
                      className="pl-9"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyze(url)}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => handleAnalyze(url)} 
                  disabled={loading || !url}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {loading && !isComparing ? 'Analyzing...' : 'Analyze Footprint'}
                </Button>
                
                {result && !isComparing && (
                  <Button variant="outline" onClick={() => setIsComparing(true)}>
                    <Scale className="h-4 w-4 mr-2" />
                    Compare
                  </Button>
                )}
              </div>

              {isComparing && (
                <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-4 border-t animate-in fade-in slide-in-from-top-2">
                  <div className="flex-1">
                    <Label htmlFor="compareUrl" className="sr-only">Compare URL</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="compareUrl" 
                        placeholder="https://competitor.com" 
                        className="pl-9"
                        value={compareUrl}
                        onChange={(e) => setCompareUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze(compareUrl, true)}
                      />
                    </div>
                  </div>
                  <Button 
                    variant="secondary"
                    onClick={() => handleAnalyze(compareUrl, true)} 
                    disabled={loading || !compareUrl}
                  >
                    {loading && isComparing ? 'Analyzing...' : 'Analyze Competitor'}
                  </Button>
                  <Button variant="ghost" onClick={() => { setIsComparing(false); setCompareResult(null); }}>
                    Cancel
                  </Button>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm flex items-start animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5 mr-3 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block mb-1">Analysis Error</strong>
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              {loading && (
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Fetching performance data from Google PageSpeed Insights...</span>
                    <span className="animate-pulse">Processing</span>
                  </div>
                  <Progress value={0} className="h-1" />
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <div id="report-content" className="space-y-8">
          {/* Results Section */}
          {result && !compareResult && (
            <section className="print:block">
              {renderResult(result)}
            </section>
          )}

          {/* Comparison Section */}
          {result && compareResult && (
            <section className="space-y-8 print:block">
              <div className="flex items-center space-x-4 print:hidden">
                <h2 className="text-2xl font-semibold tracking-tight">Comparison View</h2>
                <Separator className="flex-1" />
              </div>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Comparative Metrics Overview</CardTitle>
                  <CardDescription>Side-by-side comparison of key performance and environmental indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Primary', value: result.carbon.co2Grams },
                        { name: 'Competitor', value: compareResult.carbon.co2Grams }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'CO2 (g)', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val: any) => [`${(val || 0).toFixed(2)}g`, 'CO2 Emission']} />
                        <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>

                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Primary', value: result.metrics.pageSizeMB },
                        { name: 'Competitor', value: compareResult.metrics.pageSizeMB }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Size (MB)', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val: any) => [`${((val || 0) / 1024 / 1024).toFixed(2)} MB`, 'Size']} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>

                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Primary', value: result.metrics.loadTimeS },
                        { name: 'Competitor', value: compareResult.metrics.loadTimeS }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Time (s)', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val: any) => [`${(val || 0).toFixed(1)}s`, 'Load Time']} />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="border-r-0 xl:border-r border-border pr-0 xl:pr-4">
                  {renderResult(result, "Primary Site")}
                </div>
                <div className="pl-0 xl:pl-4">
                  {renderResult(compareResult, "Competitor Site")}
                </div>
              </div>
            </section>
          )}
        </div>

      </main>
    </div>
    </TooltipProvider>
  );
}
