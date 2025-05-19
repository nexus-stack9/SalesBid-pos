
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';

interface SalesOverviewChartProps {
  timeframe: string;
}

const chartData = {
  weekly: [
    { name: 'Mon', online: 1400, inStore: 2400 },
    { name: 'Tue', online: 1200, inStore: 1398 },
    { name: 'Wed', online: 2300, inStore: 1800 },
    { name: 'Thu', online: 2780, inStore: 1908 },
    { name: 'Fri', online: 2890, inStore: 2300 },
    { name: 'Sat', online: 3390, inStore: 2800 },
    { name: 'Sun', online: 3490, inStore: 2100 },
  ],
  monthly: [
    { name: 'Jan', online: 4400, inStore: 3400 },
    { name: 'Feb', online: 5000, inStore: 4398 },
    { name: 'Mar', online: 5300, inStore: 4800 },
    { name: 'Apr', online: 5780, inStore: 4908 },
    { name: 'May', online: 6890, inStore: 5300 },
    { name: 'Jun', online: 7390, inStore: 5800 },
    { name: 'Jul', online: 8490, inStore: 6100 },
    { name: 'Aug', online: 9000, inStore: 6500 },
    { name: 'Sep', online: 8700, inStore: 6200 },
    { name: 'Oct', online: 8200, inStore: 5900 },
    { name: 'Nov', online: 8800, inStore: 6400 },
    { name: 'Dec', online: 9500, inStore: 6800 },
  ],
  yearly: [
    { name: '2018', online: 44000, inStore: 34000 },
    { name: '2019', online: 50000, inStore: 43980 },
    { name: '2020', online: 53000, inStore: 48000 },
    { name: '2021', online: 57800, inStore: 49080 },
    { name: '2022', online: 68900, inStore: 53000 },
    { name: '2023', online: 73900, inStore: 58000 },
    { name: '2024', online: 84900, inStore: 61000 },
  ],
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border border-border rounded-md shadow-md">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-[#8b5cf6]">Online: ${payload[0].value.toLocaleString()}</p>
        <p className="text-xs text-[#c084fc]">In-Store: ${payload[1].value.toLocaleString()}</p>
      </div>
    );
  }

  return null;
};

const SalesOverviewChart = ({ timeframe }: SalesOverviewChartProps) => {
  const data = chartData[timeframe as keyof typeof chartData] || chartData.monthly;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>
            Comparison of online vs in-store sales
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 15, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                axisLine={false} 
                tickLine={false} 
                width={40}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="online" 
                stackId="1"
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="inStore" 
                stackId="2" 
                stroke="#c084fc" 
                fill="#c084fc"
                fillOpacity={0.6} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesOverviewChart;
