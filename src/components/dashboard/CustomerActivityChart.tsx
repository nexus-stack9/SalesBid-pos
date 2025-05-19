
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CustomerActivityChartProps {
  timeframe: string;
}

const CustomerActivityChart = ({ timeframe }: CustomerActivityChartProps) => {
  // Sample data that would come from an API in a real application
  const getChartData = () => {
    switch(timeframe) {
      case 'weekly':
        return [
          { name: 'Monday', active: 4000, new: 2400 },
          { name: 'Tuesday', active: 3000, new: 1398 },
          { name: 'Wednesday', active: 2000, new: 9800 },
          { name: 'Thursday', active: 2780, new: 3908 },
          { name: 'Friday', active: 1890, new: 4800 },
          { name: 'Saturday', active: 2390, new: 3800 },
          { name: 'Sunday', active: 3490, new: 4300 },
        ];
      case 'yearly':
        return [
          { name: 'Jan', active: 4000, new: 2400 },
          { name: 'Feb', active: 3000, new: 1398 },
          { name: 'Mar', active: 2000, new: 9800 },
          { name: 'Apr', active: 2780, new: 3908 },
          { name: 'May', active: 1890, new: 4800 },
          { name: 'Jun', active: 2390, new: 3800 },
          { name: 'Jul', active: 3490, new: 4300 },
          { name: 'Aug', active: 3490, new: 5300 },
          { name: 'Sep', active: 4490, new: 6300 },
          { name: 'Oct', active: 3490, new: 4300 },
          { name: 'Nov', active: 2490, new: 3300 },
          { name: 'Dec', active: 5490, new: 7300 },
        ];
      case 'monthly':
      default:
        return [
          { name: 'Week 1', active: 4000, new: 2400 },
          { name: 'Week 2', active: 3000, new: 1398 },
          { name: 'Week 3', active: 2000, new: 9800 },
          { name: 'Week 4', active: 2780, new: 3908 },
        ];
    }
  };
  
  const data = getChartData();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Activity</CardTitle>
        <CardDescription>
          Active vs New Customers {timeframe === 'weekly' ? 'this week' : timeframe === 'yearly' ? 'this year' : 'this month'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="active" stackId="1" stroke="#10b981" fill="#10b981" />
              <Area type="monotone" dataKey="new" stackId="2" stroke="#6366f1" fill="#6366f1" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerActivityChart;
