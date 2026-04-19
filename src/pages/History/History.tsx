import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

export default function HistoryPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Scan History</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Analyses</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No history found.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">CO2 (g)</TableHead>
                    <TableHead className="text-right">Size (MB)</TableHead>
                    <TableHead className="text-right">Load Time (s)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((scan) => (
                    <TableRow key={scan.id}>
                      <TableCell className="font-medium max-w-[200px] truncate" title={scan.url}>
                        {scan.url}
                      </TableCell>
                      <TableCell>{scan.createdAt?.toDate ? format(scan.createdAt.toDate(), 'MMM dd, yyyy HH:mm') : 'Unknown'}</TableCell>
                      <TableCell className="text-right font-medium text-emerald-600">{scan.co2.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{(scan.page_size / (1024 * 1024)).toFixed(2)}</TableCell>
                      <TableCell className="text-right">{(scan.load_time / 1000).toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
