
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ActivityItem {
  id: number;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  action: string;
  target: string;
  time: string;
}

const activities: ActivityItem[] = [
  {
    id: 1,
    user: {
      name: 'John Doe',
      initials: 'JD',
    },
    action: 'created',
    target: 'New Product: "Wireless Headphones"',
    time: '2 minutes ago'
  },
  {
    id: 2,
    user: {
      name: 'Sarah Johnson',
      initials: 'SJ',
    },
    action: 'updated',
    target: 'Employee Schedule for Q3',
    time: '1 hour ago'
  },
  {
    id: 3,
    user: {
      name: 'Mark Wilson',
      initials: 'MW',
    },
    action: 'deleted',
    target: 'Outdated inventory records',
    time: '3 hours ago'
  },
  {
    id: 4,
    user: {
      name: 'Emma Thompson',
      initials: 'ET',
    },
    action: 'approved',
    target: 'Store location in Chicago',
    time: '5 hours ago'
  },
];

const RecentActivity = () => {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors border-t border-border/30 first:border-0"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {activity.user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user.name}</span>
                  {' '}<span className="text-muted-foreground">{activity.action}</span>
                  {' '}<span>{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
