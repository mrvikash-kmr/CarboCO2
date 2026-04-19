import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Search, SplitSquareHorizontal, History, FileText, Settings, LogOut, Leaf, Bell, Moon, Sun } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
import { useTheme } from '../components/ThemeProvider';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';

export default function SidebarLayout() {
  const { user, firebaseUser, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    const isDark = newTheme === 'dark';
    
    // Optimistically update UI
    setTheme(newTheme);

    if (firebaseUser) {
      try {
        const dbRef = doc(db, 'users', firebaseUser.uid);
        await updateDoc(dbRef, {
          'preferences.darkMode': isDark,
          updatedAt: serverTimestamp()
        });
        
        if (user) {
          updateUser({
            ...user,
            preferences: {
              ...user.preferences,
              darkMode: isDark
            }
          });
        }
      } catch (error) {
        console.error('Failed to save theme preference', error);
        toast.error('Failed to save theme preference');
      }
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Analyze', path: '/analyze', icon: Search },
    { name: 'Compare', path: '/compare', icon: SplitSquareHorizontal },
    { name: 'History', path: '/history', icon: History },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/40 flex w-full">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background flex flex-col items-stretch hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b">
          <Leaf className="h-6 w-6 text-emerald-500 mr-2" />
          <span className="font-bold text-lg tracking-tight">EcoAnalyzer</span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 font-medium' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col flex-shrink-0 min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b bg-background flex-shrink-0 flex items-center justify-between px-6">
          <div className="flex md:hidden items-center">
            <Leaf className="h-6 w-6 text-emerald-500 mr-2" />
            <span className="font-bold text-lg tracking-tight">EcoAnalyzer</span>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition-colors"
              title="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button className="text-muted-foreground hover:text-foreground relative p-2 rounded-full hover:bg-muted transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-emerald-500 rounded-full border border-background"></span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none ml-2">
                <Avatar className="h-8 w-8 transition-transform hover:scale-105">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
