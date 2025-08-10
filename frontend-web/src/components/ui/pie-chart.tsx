import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export function PieChart({ data }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={120}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
          ))}
        </Pie>
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
