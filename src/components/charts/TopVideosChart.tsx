'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import type { TopVideo } from '@/types';

type TopVideosChartProps = {
  data: TopVideo[];
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const fullLabel = payload[0]?.payload?.title;
    return (
      <div className="rounded-lg border bg-popover p-3 shadow-lg text-popover-foreground max-w-sm">
        <p className="text-sm font-medium">{fullLabel}</p>
        <p className="text-base font-bold">
          {payload[0].value.toLocaleString()}
          <span className="text-xs font-normal text-muted-foreground"> views</span>
        </p>
      </div>
    );
  }
  return null;
};

const truncateLabel = (label: string, maxLength: number = 30) => {
  if (label.length <= maxLength) return label;
  return `${label.substring(0, maxLength)}...`;
}

export function TopVideosChart({ data }: TopVideosChartProps) {
  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-1) / 0.9)',
    'hsl(var(--chart-1) / 0.8)',
    'hsl(var(--chart-1) / 0.7)',
    'hsl(var(--chart-1) / 0.6)',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-2) / 0.9)',
    'hsl(var(--chart-2) / 0.8)',
    'hsl(var(--chart-2) / 0.7)',
    'hsl(var(--chart-2) / 0.6)',
  ].reverse();

  const chartData = [...data].reverse();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={chartData} 
        layout="vertical"
        margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis 
            type="number" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            interval="preserveStartEnd"
        />
        <YAxis
          type="category"
          dataKey="title"
          width={150}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => truncateLabel(val, 20)}
          interval={0}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
          content={<CustomTooltip />}
        />
        <Bar dataKey="views" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
