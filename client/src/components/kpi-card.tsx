import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  variant?: "default" | "success" | "warning" | "danger";
  testId?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  testId,
}: KPICardProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-chart-2/10 text-chart-2",
    warning: "bg-chart-3/10 text-chart-3",
    danger: "bg-destructive/10 text-destructive",
  };

  const trendColors = {
    up: "text-chart-2",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  };

  const TrendIcon = trend?.direction === "up" 
    ? TrendingUp 
    : trend?.direction === "down" 
      ? TrendingDown 
      : Minus;

  return (
    <Card className="border-card-border" data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-semibold tracking-tight">
                {value}
              </p>
              {trend && (
                <span className={cn("flex items-center gap-0.5 text-xs font-medium", trendColors[trend.direction])}>
                  <TrendIcon className="w-3 h-3" />
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn("flex items-center justify-center w-10 h-10 rounded-md shrink-0", variantStyles[variant])}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
