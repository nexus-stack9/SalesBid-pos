
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, User, LogOut, Settings, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getUserDataFromToken } from '@/utils/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface HeaderProps {
  onLogout: () => void;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const pathToPageName: Record<string, string> = {
  '/': 'Dashboard',
  '/employees': 'Employee Management',
  '/products': 'Product Catalog',
  '/stores': 'Store Locations',
  '/settings': 'Settings',
  '/orders': 'Orders',
  '/notifications': 'Notifications',
  // '/profile': 'Profile',
};

// Sample notifications data - in a real app this would come from an API or state management
const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Order Received',
    description: 'Order #1002 was placed by Sarah Johnson',
    time: '5 minutes ago',
    read: false
  },
  {
    id: '2',
    title: 'Low Stock Alert',
    description: 'Product "Wireless Headphones" is running low on stock',
    time: '1 hour ago',
    read: false
  },
  {
    id: '3',
    title: 'New Employee Registration',
    description: 'John Smith completed onboarding process',
    time: '3 hours ago',
    read: true
  },
  {
    id: '4',
    title: 'Weekly Report Available',
    description: 'Your weekly sales report is ready to view',
    time: '1 day ago',
    read: true
  }
];

const Header = ({ onLogout }: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchVisible, setSearchVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const currentPageName = pathToPageName[location.pathname] || 'Dashboard';
  const [userData, setUserData] = useState<{
    name?: string;
    email?: string;
  }>({});

  // Get user data from JWT token
  useEffect(() => {
    const user = getUserDataFromToken();
    if (user) {
      setUserData({
        name: user.name || user.email?.split('@')[0] || 'User',
        email: user.email || ''
      });
    }
  }, []);

  // Get initials from name (first letters of each word, up to 2 characters)
  const initials = userData.name
    ? userData.name
        .split(' ')
        .filter((_: string, index: number) => index < 2) // Take first two words max
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setNotificationsOpen(false);
    toast.success('All notifications cleared');
  };

  const handleReadNotification = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleViewAllNotifications = () => {
    setNotificationsOpen(false);
    navigate('/notifications');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <header className="bg-background border-b border-border/40 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <div className="ml-auto flex items-center space-x-4">
          {searchVisible ? (
            <div className="relative animate-fade-in">
              <Search 
                className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" 
              />
              <Input 
                type="search"
                placeholder="Search..." 
                className="w-[200px] sm:w-[300px] pl-8 bg-background"
                autoFocus
                onBlur={() => setSearchVisible(false)}
              />
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSearchVisible(true)}
              className="text-foreground/80 hover:text-foreground"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="relative text-foreground/80 hover:text-foreground"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <h3 className="font-medium text-sm">Notifications</h3>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 px-2 text-xs" 
                      onClick={handleClearAllNotifications}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Clear all
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div>
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`px-4 py-3 border-b last:border-b-0 hover:bg-accent/50 cursor-pointer transition-colors ${notification.read ? '' : 'bg-primary/5'}`}
                        onClick={() => handleReadNotification(notification.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {notification.title}
                              {!notification.read && <Badge className="ml-2 px-1 py-0 text-[10px]" variant="default">New</Badge>}
                            </p>
                            <p className="text-xs text-muted-foreground">{notification.description}</p>
                            <p className="text-xs text-muted-foreground">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                )}
              </div>
              
              {notifications.length > 0 && (
                <>
                  <Separator />
                  <div className="p-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between text-sm h-9"
                      onClick={handleViewAllNotifications}
                    >
                      View all notifications
                      <ChevronRight className="h-4 w-4 ml-1 opacity-70" />
                    </Button>
                  </div>
                </>
              )}
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-9 w-9 bg-primary/10 hover:bg-primary/20 transition-colors">
                  <AvatarFallback className="text-primary font-medium text-base">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <span className="text-2xl font-medium text-primary">
                      {initials}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium leading-none">{userData.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{userData.email}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem onClick={() => handleNavigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={() => handleNavigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="px-6 py-2 border-b border-border/40">
        <h1 className="text-2xl font-semibold tracking-tight">{currentPageName}</h1>
      </div>
    </header>
  );
};

export default Header;
