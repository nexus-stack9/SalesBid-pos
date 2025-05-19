
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Cell, 
  Pie, 
  PieChart, 
  ResponsiveContainer,
  Tooltip, 
  Legend
} from 'recharts';

interface TopSellingProductsChartProps {
  timeframe: string;
}

const chartData = {
  weekly: [
    { name: 'Smartphones', value: 35, color: '#3b82f6' },
    { name: 'Laptops', value: 25, color: '#8b5cf6' },
    { name: 'Accessories', value: 20, color: '#10b981' },
    { name: 'Tablets', value: 15, color: '#f59e0b' },
    { name: 'Wearables', value: 5, color: '#ef4444' },
  ],
  monthly: [
    { name: 'Smartphones', value: 30, color: '#3b82f6' },
    { name: 'Laptops', value: 28, color: '#8b5cf6' },
    { name: 'Accessories', value: 22, color: '#10b981' },
    { name: 'Tablets', value: 12, color: '#f59e0b' },
    { name: 'Wearables', value: 8, color: '#ef4444' },
  ],
  yearly: [
    { name: 'Smartphones', value: 32, color: '#3b82f6' },
    { name: 'Laptops', value: 26, color: '#8b5cf6' },
    { name: 'Accessories', value: 18, color: '#10b981' },
    { name: 'Tablets', value: 14, color: '#f59e0b' },
    { name: 'Wearables', value: 10, color: '#ef4444' },
  ],
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background p-3 border border-border rounded-md shadow-md">
        <p className="text-sm font-medium">{data.name}</p>
        <p className="text-xs">
          <span className="font-medium">{data.value}%</span> of total sales
        </p>
      </div>
    );
  }

  return null;
};

const TopSellingProductsChart = ({ timeframe }: TopSellingProductsChartProps) => {
  const data = chartData[timeframe as keyof typeof chartData] || chartData.monthly;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>
            Product categories by sales percentage
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={130}
                innerRadius={70}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopSellingProductsChart;
