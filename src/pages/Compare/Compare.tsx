import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Globe, AlertCircle, Scale, History as HistoryIcon, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import axios from 'axios';
import { Progress } from '@/components/ui/progress';
import { doc, setDoc, serverTimestamp, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export default function Compare() {
  const { firebaseUser } = useAuth();
  const [url1, setUrl1] = useState('');
  const [url2, setUrl2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<{site1: any, site2: any} | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [filterUrl, setFilterUrl] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc'>('date_desc');

  const fetchHistory = async () => {
    if (!firebaseUser) return;
    try {
      const q = query(
        collection(db, 'comparisons'),
        where('userId', '==', firebaseUser.uid),
        orderBy('createdAt', sortBy === 'date_desc' ? 'desc' : 'asc')
      );
      const querySnapshot = await getDocs(q);
      const comparisons = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(comparisons);
    } catch (error) {
      console.error("Error fetching comparison history: ", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [firebaseUser, sortBy]);

  const handleCompare = async () => {
    if (!url1 || !url2) {
      setError('Please enter both URLs');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/compare', { url1, url2 });
      const data = res.data;
      setResults(data);

      if (firebaseUser) {
        const docId = Date.now().toString();
        await setDoc(doc(db, 'comparisons', docId), {
          userId: firebaseUser.uid,
          url1: data.site1.url,
          url2: data.site2.url,
          site1: {
            co2: data.site1.carbon.co2Grams,
            page_size: data.site1.metrics.pageSizeBytes,
            load_time: data.site1.metrics.loadTimeMs
          },
          site2: {
            co2: data.site2.carbon.co2Grams,
            page_size: data.site2.metrics.pageSizeBytes,
            load_time: data.site2.metrics.loadTimeMs
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        fetchHistory(); // Refresh history
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };
  
  const filteredHistory = history.filter(c => 
    c.url1.toLowerCase().includes(filterUrl.toLowerCase()) || 
    c.url2.toLowerCase().includes(filterUrl.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Compare Sites</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Side-by-Side Analysis</CardTitle>
          <CardDescription>Enter two URLs to compare their performance and carbon footprints.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Label htmlFor="url1">Primary Website</Label>
              <div className="relative mt-1">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="url1" placeholder="https://example.com" className="pl-9" value={url1} onChange={(e) => setUrl1(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCompare()} />
              </div>
            </div>
            
            <div className="hidden md:flex pb-2 text-muted-foreground font-bold">VS</div>

            <div className="flex-1 w-full">
              <Label htmlFor="url2">Competitor Website</Label>
              <div className="relative mt-1">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="url2" placeholder="https://competitor.com" className="pl-9" value={url2} onChange={(e) => setUrl2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCompare()} />
              </div>
            </div>

            <Button onClick={handleCompare} disabled={loading || !url1 || !url2} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
              <Scale className="mr-2 h-4 w-4" /> 
              {loading ? 'Comparing...' : 'Compare Goals'}
            </Button>
          </div>

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
                <span>Analyzing both sites... This may take up to a minute.</span>
                <span className="animate-pulse">Processing</span>
              </div>
              <Progress value={0} className="h-1" />
            </div>
          )}
        </CardContent>
      </Card>

      {results && (
        <div className="grid gap-6 animate-in slide-in-from-bottom-4 duration-500">
          <Card>
            <CardHeader>
              <CardTitle>Comparative Metrics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Site 1', value: results.site1.carbon.co2Grams },
                    { name: 'Site 2', value: results.site2.carbon.co2Grams }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickFormatter={(val) => val === 'Site 1' ? 'Primary' : 'Competitor'} />
                    <YAxis label={{ value: 'CO2 (g)', angle: -90, position: 'insideLeft' }} />
                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val: any) => [`${(val || 0).toFixed(2)}g`, 'CO2 Emission']} />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Site 1', value: results.site1.metrics.pageSizeMB },
                    { name: 'Site 2', value: results.site2.metrics.pageSizeMB }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickFormatter={(val) => val === 'Site 1' ? 'Primary' : 'Competitor'} />
                    <YAxis label={{ value: 'Size (MB)', angle: -90, position: 'insideLeft' }} />
                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val: any) => [`${((val || 0) / 1024 / 1024).toFixed(2)} MB`, 'Size']} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Site 1', value: results.site1.metrics.loadTimeS },
                    { name: 'Site 2', value: results.site2.metrics.loadTimeS }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickFormatter={(val) => val === 'Site 1' ? 'Primary' : 'Competitor'} />
                    <YAxis label={{ value: 'Time (s)', angle: -90, position: 'insideLeft' }} />
                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val: any) => [`${(val || 0).toFixed(1)}s`, 'Load Time']} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center">
                <HistoryIcon className="mr-2 h-5 w-5 text-emerald-600" />
                Comparison History
              </CardTitle>
              <CardDescription>View your past side-by-side analyses.</CardDescription>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input 
                placeholder="Filter by URL..." 
                value={filterUrl}
                onChange={(e) => setFilterUrl(e.target.value)}
                className="max-w-[200px]"
              />
              <Button 
                variant="outline" 
                onClick={() => setSortBy(sortBy === 'date_desc' ? 'date_asc' : 'date_desc')}
                title="Sort by Date"
              >
                <Clock className="h-4 w-4 mr-2" />
                {sortBy === 'date_desc' ? 'Newest' : 'Oldest'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="text-center py-8 text-muted-foreground">Loading history...</div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-md">
              <Scale className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p>No comparison history found.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Primary URL</TableHead>
                    <TableHead>Competitor URL</TableHead>
                    <TableHead className="text-right">Primary CO2</TableHead>
                    <TableHead className="text-right">Competitor CO2</TableHead>
                    <TableHead className="text-center">Winner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((comp) => {
                    const primaryCo2 = comp.site1?.co2 || 0;
                    const compCo2 = comp.site2?.co2 || 0;
                    const isPrimaryBetter = primaryCo2 <= compCo2;

                    return (
                      <TableRow key={comp.id} className="cursor-pointer hover:bg-muted/50" onClick={() => {
                        setUrl1(comp.url1);
                        setUrl2(comp.url2);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}>
                        <TableCell className="whitespace-nowrap">
                          {comp.createdAt?.toDate ? format(comp.createdAt.toDate(), 'MMM dd, yyyy HH:mm') : 'Unknown'}
                        </TableCell>
                        <TableCell className="font-medium max-w-[150px] truncate" title={comp.url1}>
                          {comp.url1.replace(/^https?:\/\//, '')}
                        </TableCell>
                        <TableCell className="font-medium max-w-[150px] truncate" title={comp.url2}>
                          {comp.url2.replace(/^https?:\/\//, '')}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${isPrimaryBetter ? 'text-emerald-600' : 'text-red-500'}`}>
                          {primaryCo2.toFixed(2)}g
                        </TableCell>
                        <TableCell className={`text-right font-medium ${!isPrimaryBetter ? 'text-emerald-600' : 'text-red-500'}`}>
                          {compCo2.toFixed(2)}g
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${isPrimaryBetter ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                            {isPrimaryBetter ? 'Primary' : 'Competitor'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
