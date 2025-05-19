
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Line, 
  LineChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  Legend 
} from 'recharts';

interface RevenueTrendsChartProps {
  timeframe: string;
}

const chartData = {
  weekly: [
    { name: 'Mon', actual: 4000, projected: 3000 },
    { name: 'Tue', actual: 3000, projected: 3200 },
    { name: 'Wed', actual: 2000, projected: 3400 },
    { name: 'Thu', actual: 2780, projected: 3600 },
    { name: 'Fri', actual: 1890, projected: 3800 },
    { name: 'Sat', actual: 2390, projected: 4000 },
    { name: 'Sun', actual: 3490, projected: 4200 },
  ],
  monthly: [
    { name: 'Jan', actual: 4000, projected: 3500 },
    { name: 'Feb', actual: 3000, projected: 3700 },
    { name: 'Mar', actual: 2000, projected: 3900 },
    { name: 'Apr', actual: 2780, projected: 4100 },
    { name: 'May', actual: 1890, projected: 4300 },
    { name: 'Jun', actual: 2390, projected: 4500 },
    { name: 'Jul', actual: 3490, projected: 4700 },
    { name: 'Aug', actual: 4000, projected: 4900 },
    { name: 'Sep', actual: 4500, projected: 5100 },
    { name: 'Oct', actual: 5000, projected: 5300 },
    { name: 'Nov', actual: 5500, projected: 5500 },
    { name: 'Dec', actual: 6000, projected: 5700 },
  ],
  yearly: [
    { name: '2018', actual: 24000, projected: 20000 },
    { name: '2019', actual: 32000, projected: 30000 },
    { name: '2020', actual: 29000, projected: 35000 },
    { name: '2021', actual: 37800, projected: 40000 },
    { name: '2022', actual: 42890, projected: 45000 },
    { name: '2023', actual: 49390, projected: 50000 },
    { name: '2024', actual: 53490, projected: 55000 },
  ],
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border border-border rounded-md shadow-md">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-[#10b981]">Actual: ${payload[0].value.toLocaleString()}</p>
        <p className="text-xs text-[#6b7280]">Projected: ${payload[1].value.toLocaleString()}</p>
      </div>
    );
  }

  return null;
};

const RevenueTrendsChart = ({ timeframe }: RevenueTrendsChartProps) => {
  const data = chartData[timeframe as keyof typeof chartData] || chartData.monthly;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>
            Actual vs projected revenue
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 15, left: 5, bottom: 5 }}>
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
              <Legend />
              <Line 
                type="monotone" 
                dataKey="actual" 
                name="Actual" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line 
                type="monotone" 
                dataKey="projected" 
                name="Projected" 
                stroke="#6b7280" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueTrendsChart;
