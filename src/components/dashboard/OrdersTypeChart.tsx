
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OrdersTypeChartProps {
  timeframe: string;
}

const OrdersTypeChart = ({ timeframe }: OrdersTypeChartProps) => {
  // This would come from an API in a real application
  // Simulating different data based on timeframe
  const getChartData = () => {
    switch(timeframe) {
      case 'weekly':
        return [
          { name: 'Online Orders', value: 65 },
          { name: 'In-store Orders', value: 35 },
        ];
      case 'yearly':
        return [
          { name: 'Online Orders', value: 72 },
          { name: 'In-store Orders', value: 28 },
        ];
      case 'monthly':
      default:
        return [
          { name: 'Online Orders', value: 68 },
          { name: 'In-store Orders', value: 32 },
        ];
    }
  };
  
  const data = getChartData();
  const COLORS = ['#3b82f6', '#8b5cf6'];
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Distribution</CardTitle>
        <CardDescription>
          Online vs In-store orders {timeframe === 'weekly' ? 'this week' : timeframe === 'yearly' ? 'this year' : 'this month'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1000}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersTypeChart;
