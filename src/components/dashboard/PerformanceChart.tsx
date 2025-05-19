
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  Legend 
} from 'recharts';

interface PerformanceChartProps {
  timeframe: string;
}

const chartData = {
  weekly: [
    { name: 'Mon', sales: 4000, revenue: 2400, profit: 1600 },
    { name: 'Tue', sales: 3000, revenue: 1398, profit: 1000 },
    { name: 'Wed', sales: 2000, revenue: 9800, profit: 4800 },
    { name: 'Thu', sales: 2780, revenue: 3908, profit: 1500 },
    { name: 'Fri', sales: 1890, revenue: 4800, profit: 2200 },
    { name: 'Sat', sales: 2390, revenue: 3800, profit: 1800 },
    { name: 'Sun', sales: 3490, revenue: 4300, profit: 2100 },
  ],
  monthly: [
    { name: 'Jan', sales: 4000, revenue: 2400, profit: 1600 },
    { name: 'Feb', sales: 3000, revenue: 1398, profit: 1000 },
    { name: 'Mar', sales: 2000, revenue: 9800, profit: 4800 },
    { name: 'Apr', sales: 2780, revenue: 3908, profit: 1500 },
    { name: 'May', sales: 1890, revenue: 4800, profit: 2200 },
    { name: 'Jun', sales: 2390, revenue: 3800, profit: 1800 },
    { name: 'Jul', sales: 3490, revenue: 4300, profit: 2100 },
    { name: 'Aug', sales: 3490, revenue: 4300, profit: 2100 },
    { name: 'Sep', sales: 3490, revenue: 4300, profit: 2100 },
    { name: 'Oct', sales: 3490, revenue: 4300, profit: 2100 },
    { name: 'Nov', sales: 3490, revenue: 4300, profit: 2100 },
    { name: 'Dec', sales: 3490, revenue: 4300, profit: 2100 },
  ],
  yearly: [
    { name: '2018', sales: 24000, revenue: 18400, profit: 8600 },
    { name: '2019', sales: 32000, revenue: 22398, profit: 12000 },
    { name: '2020', sales: 19000, revenue: 15800, profit: 7800 },
    { name: '2021', sales: 27800, revenue: 20908, profit: 11500 },
    { name: '2022', sales: 32890, revenue: 24800, profit: 14200 },
    { name: '2023', sales: 39000, revenue: 33800, profit: 18800 },
    { name: '2024', sales: 43490, revenue: 37300, profit: 21100 },
  ],
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border border-border rounded-md shadow-md">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-[#3b82f6]">Sales: ${payload[0].value.toLocaleString()}</p>
        <p className="text-xs text-[#69b2f8]">Revenue: ${payload[1].value.toLocaleString()}</p>
        <p className="text-xs text-[#10b981]">Profit: ${payload[2].value.toLocaleString()}</p>
      </div>
    );
  }

  return null;
};

const PerformanceChart = ({ timeframe }: PerformanceChartProps) => {
  const data = chartData[timeframe as keyof typeof chartData] || chartData.monthly;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 15, left: 5, bottom: 5 }}>
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
          <Bar dataKey="sales" name="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="revenue" name="Revenue" fill="#69b2f8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
