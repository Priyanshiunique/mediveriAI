import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ConfidenceIndicatorProps {
  confidence: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ConfidenceIndicator({
  confidence,
  showLabel = true,
  size = "md",
  className,
}: ConfidenceIndicatorProps) {
  const getColor = () => {
    if (confidence >= 90) return "bg-chart-2";
    if (confidence >= 70) return "bg-chart-3";
    return "bg-destructive";
  };

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex-1 bg-muted rounded-full overflow-hidden", sizeClasses[size])}>
            <div
              className={cn("h-full rounded-full transition-all duration-300", getColor())}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Confidence: {confidence.toFixed(1)}%</p>
        </TooltipContent>
      </Tooltip>
      {showLabel && (
        <span className={cn(
          "font-mono text-xs font-medium tabular-nums",
          confidence >= 90 ? "text-chart-2" : confidence >= 70 ? "text-chart-3" : "text-destructive"
        )}>
          {confidence.toFixed(0)}%
        </span>
      )}
    </div>
  );
}

interface FieldConfidenceRowProps {
  fieldName: string;
  value: string | null;
  confidence: number;
  source: string;
  hasDiscrepancy?: boolean;
}

export function FieldConfidenceRow({
  fieldName,
  value,
  confidence,
  source,
  hasDiscrepancy,
}: FieldConfidenceRowProps) {
  return (
    <div className={cn(
      "flex items-center gap-4 py-3 px-4 rounded-md",
      hasDiscrepancy ? "bg-chart-3/5 border border-chart-3/20" : "bg-muted/50"
    )}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium capitalize">
          {fieldName.replace(/([A-Z])/g, ' $1').trim()}
        </p>
        <p className={cn(
          "text-sm mt-0.5 truncate",
          value ? "text-foreground" : "text-muted-foreground italic"
        )}>
          {value || "Not provided"}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-muted-foreground capitalize">
          {source.replace(/_/g, ' ')}
        </span>
        <ConfidenceIndicator confidence={confidence} size="sm" className="w-24" />
      </div>
    </div>
  );
}
