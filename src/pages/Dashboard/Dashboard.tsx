import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Leaf, Activity, Globe, Zap } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { firebaseUser } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    
    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, 'scans'),
          where('userId', '==', firebaseUser.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const scans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHistory(scans);
      } catch (error) {
        console.error("Error fetching history: ", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [firebaseUser]);

  if (loading) return <div>Loading dashboard...</div>;

  const totalScans = history.length;
  // Calculate average load time
  const avgLoadTimeMs = totalScans ? (history.reduce((acc, scan) => acc + scan.load_time, 0) / totalScans) : 0;
  
  // Calculate monthly emissions (scans in current month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyScans = history.filter(scan => {
    if (!scan.createdAt) return false;
    const date = scan.createdAt.toDate ? scan.createdAt.toDate() : new Date(scan.createdAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  const monthlyEmissions = monthlyScans.reduce((acc, scan) => acc + scan.co2, 0);

  const avgCo2 = totalScans ? (history.reduce((acc, scan) => acc + scan.co2, 0) / totalScans).toFixed(2) : 0;
  const latestScan = history[0];

  const chartData = history.slice(0, 10).reverse().map(scan => {
    const dateObj = scan.createdAt?.toDate ? scan.createdAt.toDate() : new Date(scan.createdAt || Date.now());
    return {
      date: format(dateObj, 'MMM dd'),
      co2: parseFloat(scan.co2.toFixed(2))
    };
  });

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];
  const breakdownData = latestScan ? [
    { name: 'HTML', value: latestScan.breakdown.html },
    { name: 'CSS', value: latestScan.breakdown.css },
    { name: 'JavaScript', value: latestScan.breakdown.js },
    { name: 'Images', value: latestScan.breakdown.image },
    { name: 'Fonts', value: latestScan.breakdown.font },
    { name: 'Other', value: latestScan.breakdown.other },
  ].filter(item => item.value > 0) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Link to="/analyze">
          <Button className="bg-emerald-600 hover:bg-emerald-700">New Analysis</Button>
        </Link>
      </div>

      {totalScans === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full mb-4">
            <Globe className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No data yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">You haven't run any carbon footprint analyses yet. Start by scanning your first website.</p>
          <Link to="/analyze">
            <Button>Scan a Website</Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalScans}</div>
                <p className="text-xs text-muted-foreground">Lifetime analyses</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Emissions</CardTitle>
                <Leaf className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthlyEmissions.toFixed(2)}g</div>
                <p className="text-xs text-muted-foreground">CO2 emitted this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Load Time</CardTitle>
                <Zap className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(avgLoadTimeMs / 1000).toFixed(2)}s</div>
                <p className="text-xs text-muted-foreground">Average across all scans</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg CO2 / Visit</CardTitle>
                <Leaf className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgCo2}g</div>
                <p className="text-xs text-muted-foreground">Per scan average</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>CO2 Emissions Over Time</CardTitle>
                <CardDescription>Your last 10 scans</CardDescription>
              </CardHeader>
              <CardContent className="pl-2 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: 'CO2 (g)', angle: -90, position: 'insideLeft' }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                      formatter={(value: any) => [`${(value || 0)}g`, 'CO2 Emission']} 
                      labelFormatter={(label) => `Date: ${label}`} 
                    />
                    <Line type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Latest Resource Breakdown</CardTitle>
                <CardDescription>From your most recent scan ({latestScan.url})</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {breakdownData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(val: any) => [`${((val || 0) / 1024 / 1024).toFixed(2)} MB`, 'Size']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
