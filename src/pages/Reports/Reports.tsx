import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import html2pdf from 'html2pdf.js';

export default function Reports() {
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [scans, setScans] = useState<any[]>([]);
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
        const fetchedScans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setScans(fetchedScans);
      } catch (error) {
        console.error("Error fetching history: ", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [firebaseUser]);

  const handleDownloadPDF = (scan: any) => {
    // Generate a quick hidden element for PDF conversion
    const container = document.createElement('div');
    const safeDate = scan.createdAt?.toDate ? format(scan.createdAt.toDate(), 'yyyy-MM-dd HH:mm:ss') : 'Unknown';
    
    container.innerHTML = `
      <div style="font-family: sans-serif; padding: 40px; color: #1f2937;">
        <h1 style="color: #10b981; margin-bottom: 20px;">EcoAnalyzer ESG Carbon Report</h1>
        <h2 style="font-size: 1.25rem; font-weight: 600;">Website: ${scan.url}</h2>
        <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 30px;">Generated on: ${safeDate}</p>
        
        <div style="display: flex; gap: 20px; margin-bottom: 30px;">
          <div style="flex: 1; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <p style="margin: 0; font-size: 0.875rem; color: #6b7280;">Estimated CO2</p>
            <p style="margin: 5px 0 0; font-size: 1.5rem; font-weight: bold; color: #10b981;">${scan.co2.toFixed(2)}g</p>
          </div>
          <div style="flex: 1; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <p style="margin: 0; font-size: 0.875rem; color: #6b7280;">Energy Used</p>
            <p style="margin: 5px 0 0; font-size: 1.5rem; font-weight: bold;">${scan.energy.toFixed(5)} kWh</p>
          </div>
        </div>
        
        <div style="display: flex; gap: 20px; margin-bottom: 30px;">
          <div style="flex: 1; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <p style="margin: 0; font-size: 0.875rem; color: #6b7280;">Page Size</p>
            <p style="margin: 5px 0 0; font-size: 1.5rem; font-weight: bold;">${(scan.page_size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
          <div style="flex: 1; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <p style="margin: 0; font-size: 0.875rem; color: #6b7280;">Load Time</p>
            <p style="margin: 5px 0 0; font-size: 1.5rem; font-weight: bold;">${(scan.load_time / 1000).toFixed(1)}s</p>
          </div>
        </div>

        <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 10px;">Executive Recommendations</h3>
        <ul style="padding-left: 20px;">
          ${scan.recommendations.map((r: any) => `<li style="margin-bottom: 10px;"><strong>${r.title}:</strong> ${r.description}</li>`).join('')}
        </ul>
      </div>
    `;

    const opt: any = {
      margin:       0.5,
      filename:     `ESG_Report_${scan.url.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(container).save();
  };

  const handleView = (url: string) => {
    navigate(`/?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p>Loading reports...</p>
        ) : scans.length === 0 ? (
          <p>No reports available.</p>
        ) : (
          scans.map(scan => (
            <Card key={scan.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="truncate">{scan.url.replace(/^https?:\/\//, '')}</CardTitle>
                <CardDescription>{scan.createdAt?.toDate ? format(scan.createdAt.toDate(), 'MMM dd, yyyy') : 'Unknown'}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CO2</span>
                    <span className="font-medium text-emerald-600">{scan.co2.toFixed(2)}g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Load Time</span>
                    <span className="font-medium">{(scan.load_time / 1000).toFixed(1)}s</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => handleView(scan.url)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => handleDownloadPDF(scan)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
