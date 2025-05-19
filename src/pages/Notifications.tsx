
import { useState } from 'react';
import { Bell, CheckCheck, Clock, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: string;
}

// Sample notifications data - in a real app this would come from an API
const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Order Received',
    description: 'Order #1002 was placed by Sarah Johnson',
    time: '5 minutes ago',
    read: false,
    type: 'order'
  },
  {
    id: '2',
    title: 'Low Stock Alert',
    description: 'Product "Wireless Headphones" is running low on stock',
    time: '1 hour ago',
    read: false,
    type: 'inventory'
  },
  {
    id: '3',
    title: 'New Employee Registration',
    description: 'John Smith completed onboarding process',
    time: '3 hours ago',
    read: true,
    type: 'employee'
  },
  {
    id: '4',
    title: 'Weekly Report Available',
    description: 'Your weekly sales report is ready to view',
    time: '1 day ago',
    read: true,
    type: 'report'
  },
  {
    id: '5',
    title: 'System Update Scheduled',
    description: 'A system maintenance is scheduled for tomorrow at 2 AM',
    time: '2 days ago',
    read: true,
    type: 'system'
  },
  {
    id: '6',
    title: 'Payment Processed',
    description: 'Payment for order #995 has been successfully processed',
    time: '3 days ago',
    read: true,
    type: 'order'
  },
  {
    id: '7',
    title: 'New Store Location Added',
    description: 'San Francisco store has been added to your locations',
    time: '1 week ago',
    read: true,
    type: 'store'
  }
];

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter notifications based on search and filters
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = 
      typeFilter === 'all' || 
      notification.type === typeFilter;

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'read' && notification.read) || 
      (statusFilter === 'unread' && !notification.read);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    toast.success('All notifications marked as read');
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={notifications.length === 0 || notifications.every(n => n.read)}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearAll}
            disabled={notifications.length === 0}
          >
            <Bell className="mr-2 h-4 w-4" />
            Clear all
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notification Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 md:flex md:items-center">
              <div className="w-full md:w-[160px]">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="order">Orders</SelectItem>
                    <SelectItem value="inventory">Inventory</SelectItem>
                    <SelectItem value="employee">Employees</SelectItem>
                    <SelectItem value="report">Reports</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="store">Stores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-[160px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon" className="w-10 h-10 md:ml-2">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`rounded-lg border p-4 transition-colors hover:bg-accent/50 ${notification.read ? '' : 'bg-primary/5'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        {!notification.read && (
                          <Badge className="ml-2" variant="default">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {notification.time}
                      </div>
                    </div>
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs" 
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <Badge 
                      variant="outline" 
                      className="capitalize"
                    >
                      {notification.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {notification.read ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="mx-auto h-12 w-12 opacity-20 mb-2" />
                <h3 className="text-lg font-medium mb-1">No notifications found</h3>
                <p className="text-sm">
                  {notifications.length === 0 
                    ? "You have no notifications at the moment." 
                    : "No notifications match your current filters."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
