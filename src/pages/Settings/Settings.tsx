import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'sonner';

export default function Settings() {
  const { user, firebaseUser, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [darkMode, setDarkMode] = useState(user?.preferences?.darkMode || false);
  const [notifications, setNotifications] = useState<boolean>(user?.preferences?.notificationsEnabled ?? true);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!firebaseUser) return;
    
    setLoading(true);
    try {
      const dbRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(dbRef, {
        name,
        email,
        preferences: {
          darkMode,
          notificationsEnabled: notifications
        },
        updatedAt: serverTimestamp()
      });
      
      if (user) {
        updateUser({
          ...user,
          name,
          email,
          preferences: {
            darkMode,
            notificationsEnabled: notifications
          }
        });
      }
      toast.success('Settings saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <p className="text-xs text-muted-foreground">This updates your profile email for reports and notifications. Your Google sign-in remains the same.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Manage your app experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle the dark theme of the application.</p>
            </div>
            <Switch checked={darkMode} onCheckedChange={(checked: boolean) => setDarkMode(checked)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive alerts for reports and summaries.</p>
            </div>
            <Switch checked={notifications} onCheckedChange={(checked: boolean) => setNotifications(checked)} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
}
