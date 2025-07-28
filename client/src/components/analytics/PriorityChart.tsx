import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

interface PriorityData {
  priority: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
}

interface PriorityChartProps {
  data: PriorityData[];
}

const PriorityChart: React.FC<PriorityChartProps> = ({ data }) => {
  const { theme } = useTheme();

  const COLORS = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
  };

  const formatData = (data: PriorityData[]) => {
    // If no data, create default structure to show empty state
    if (!data || data.length === 0) {
      return [
        { name: 'High', value: 0, completed: 0, rate: 0, color: COLORS.high },
        { name: 'Medium', value: 0, completed: 0, rate: 0, color: COLORS.medium },
        { name: 'Low', value: 0, completed: 0, rate: 0, color: COLORS.low },
      ];
    }

    // Ensure all priority levels are represented
    const priorities = ['high', 'medium', 'low'];
    const result = priorities.map(priority => {
      const item = data.find(d => d.priority === priority);
      return {
        name: priority.charAt(0).toUpperCase() + priority.slice(1),
        value: item?.total_tasks || 0,
        completed: item?.completed_tasks || 0,
        rate: item?.completion_rate || 0,
        color: COLORS[priority as keyof typeof COLORS],
      };
    });

    return result;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-dark-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {data.name} Priority
          </p>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Tasks: {data.value}
            </p>
            <p className="text-sm text-green-600">
              Completed: {data.completed}
            </p>
            <p className="text-sm text-blue-600">
              Success Rate: {data.rate}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for very small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={theme === 'dark' ? '#ffffff' : '#000000'}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No priority data available
      </div>
    );
  }

  const chartData = formatData(data);
  const hasData = chartData.some(item => item.value > 0);

  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No tasks yet. Create your first task to see priority distribution.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span style={{ color: theme === 'dark' ? '#e5e7eb' : '#374151' }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriorityChart;
