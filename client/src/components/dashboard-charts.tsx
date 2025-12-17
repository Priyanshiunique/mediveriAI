import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ConfidenceDistribution, StatusBreakdown } from "@shared/schema";

interface StatusPieChartProps {
  data: StatusBreakdown[];
}

const statusColors = {
  verified: "hsl(var(--chart-2))",
  flagged: "hsl(var(--chart-3))",
  pending: "hsl(var(--chart-1))",
  error: "hsl(var(--destructive))",
};

export function StatusPieChart({ data }: StatusPieChartProps) {
  const chartData = data.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    color: statusColors[item.status as keyof typeof statusColors] || "hsl(var(--muted))",
  }));

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Provider Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">
                {item.name}: {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ConfidenceBarChartProps {
  data: ConfidenceDistribution[];
}

export function ConfidenceBarChart({ data }: ConfidenceBarChartProps) {
  const getBarColor = (range: string) => {
    if (range.includes("90") || range.includes("100")) return "hsl(var(--chart-2))";
    if (range.includes("70") || range.includes("80")) return "hsl(var(--chart-3))";
    return "hsl(var(--destructive))";
  };

  const chartData = data.map((item) => ({
    range: item.range,
    count: item.count,
    fill: getBarColor(item.range),
  }));

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Confidence Score Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis
                type="category"
                dataKey="range"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`${value} providers`, "Count"]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface RecentActivityProps {
  activities: {
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }[];
}

export function RecentActivityCard({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "validation":
        return "bg-chart-2/10 text-chart-2";
      case "flagged":
        return "bg-chart-3/10 text-chart-3";
      case "error":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity
            </p>
          ) : (
            activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${getActivityIcon(activity.type).split(" ")[0]}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ProcessingMetricsProps {
  metrics: {
    label: string;
    value: string | number;
    target?: string | number;
    unit?: string;
  }[];
}

export function ProcessingMetricsCard({ metrics }: ProcessingMetricsProps) {
  return (
    <Card className="border-card-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Processing Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{metric.label}</span>
              <div className="text-right">
                <span className="text-sm font-medium">
                  {metric.value}
                  {metric.unit}
                </span>
                {metric.target && (
                  <span className="text-xs text-muted-foreground ml-1">
                    / target: {metric.target}
                    {metric.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
