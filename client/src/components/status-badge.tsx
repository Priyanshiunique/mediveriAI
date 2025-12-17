import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, Clock, XCircle } from "lucide-react";
import type { ProviderStatusType, PriorityLevelType } from "@shared/schema";

interface StatusBadgeProps {
  status: ProviderStatusType;
  className?: string;
}

const statusConfig = {
  verified: {
    label: "Verified",
    icon: CheckCircle2,
    className: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  },
  flagged: {
    label: "Flagged",
    icon: AlertTriangle,
    className: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  error: {
    label: "Error",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn("gap-1 font-medium border", config.className, className)}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

interface PriorityBadgeProps {
  priority: PriorityLevelType;
  className?: string;
}

const priorityConfig = {
  high: {
    label: "High",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  medium: {
    label: "Medium",
    icon: AlertTriangle,
    className: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  },
  low: {
    label: "Low",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Badge 
      variant="outline" 
      className={cn("font-medium border", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

interface ConfidenceBadgeProps {
  confidence: number;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const getConfig = () => {
    if (confidence >= 90) {
      return { className: "bg-chart-2/10 text-chart-2 border-chart-2/20" };
    } else if (confidence >= 70) {
      return { className: "bg-chart-3/10 text-chart-3 border-chart-3/20" };
    } else {
      return { className: "bg-destructive/10 text-destructive border-destructive/20" };
    }
  };

  const config = getConfig();

  return (
    <Badge 
      variant="outline" 
      className={cn("font-mono font-medium border", config.className, className)}
    >
      {confidence.toFixed(0)}%
    </Badge>
  );
}
