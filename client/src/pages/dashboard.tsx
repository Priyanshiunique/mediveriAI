import { useQuery } from "@tanstack/react-query";
import { KPICard } from "@/components/kpi-card";
import {
  StatusPieChart,
  ConfidenceBarChart,
  RecentActivityCard,
  ProcessingMetricsCard,
} from "@/components/dashboard-charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Percent,
  Timer,
  FileText,
  ClipboardCheck,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react";
import { Link } from "wouter";
import type { DashboardStats, ConfidenceDistribution, StatusBreakdown } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, refetch } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: statusBreakdown, isLoading: statusLoading } = useQuery<StatusBreakdown[]>({
    queryKey: ["/api/stats/status-breakdown"],
  });

  const { data: confidenceDistribution, isLoading: confidenceLoading } = useQuery<
    ConfidenceDistribution[]
  >({
    queryKey: ["/api/stats/confidence-distribution"],
  });

  const recentActivities = [
    {
      id: "1",
      type: "validation",
      message: "Validated 50 providers from batch upload",
      timestamp: "5 minutes ago",
    },
    {
      id: "2",
      type: "flagged",
      message: "3 providers flagged for address verification",
      timestamp: "12 minutes ago",
    },
    {
      id: "3",
      type: "upload",
      message: "CSV file processed: providers_batch_12.csv",
      timestamp: "25 minutes ago",
    },
    {
      id: "4",
      type: "validation",
      message: "NPI verification completed for 75 records",
      timestamp: "1 hour ago",
    },
  ];

  const processingMetrics = [
    {
      label: "Avg. Processing Time",
      value: stats?.processingTime || 0,
      target: 30,
      unit: " min",
    },
    {
      label: "PDF Extraction Accuracy",
      value: stats?.pdfExtractionAccuracy || 0,
      unit: "%",
    },
    {
      label: "Validation Accuracy",
      value: stats?.validationAccuracy || 0,
      unit: "%",
    },
    {
      label: "Manual Review Rate",
      value: stats?.totalProviders
        ? ((stats.providersNeedingReview / stats.totalProviders) * 100).toFixed(1)
        : 0,
      unit: "%",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Provider data validation overview and key metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            data-testid="button-refresh-stats"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link href="/upload">
            <Button size="sm" data-testid="button-upload-data">
              <Upload className="w-4 h-4 mr-2" />
              Upload Data
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-card-border">
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <KPICard
              title="Total Providers"
              value={stats?.totalProviders || 0}
              subtitle="In directory"
              icon={Users}
              testId="kpi-total-providers"
            />
            <KPICard
              title="Verified"
              value={stats?.verifiedProviders || 0}
              subtitle={`${stats?.totalProviders ? ((stats.verifiedProviders / stats.totalProviders) * 100).toFixed(1) : 0}% of total`}
              icon={CheckCircle2}
              variant="success"
              testId="kpi-verified"
            />
            <KPICard
              title="Flagged"
              value={stats?.flaggedProviders || 0}
              subtitle="Need review"
              icon={AlertTriangle}
              variant="warning"
              testId="kpi-flagged"
            />
            <KPICard
              title="Pending"
              value={stats?.pendingProviders || 0}
              subtitle="Awaiting validation"
              icon={Clock}
              testId="kpi-pending"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-card-border">
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <KPICard
              title="Avg. Confidence"
              value={`${(stats?.averageConfidence || 0).toFixed(1)}%`}
              icon={Percent}
              variant={
                (stats?.averageConfidence || 0) >= 90
                  ? "success"
                  : (stats?.averageConfidence || 0) >= 70
                  ? "warning"
                  : "danger"
              }
              testId="kpi-avg-confidence"
            />
            <KPICard
              title="Validation Accuracy"
              value={`${(stats?.validationAccuracy || 0).toFixed(1)}%`}
              icon={CheckCircle2}
              variant="success"
              testId="kpi-validation-accuracy"
            />
            <KPICard
              title="Processing Time"
              value={`${stats?.processingTime || 0} min`}
              subtitle="For 200 providers"
              icon={Timer}
              testId="kpi-processing-time"
            />
            <KPICard
              title="Review Queue"
              value={stats?.providersNeedingReview || 0}
              subtitle="Items pending"
              icon={ClipboardCheck}
              variant={
                (stats?.providersNeedingReview || 0) > 20
                  ? "danger"
                  : (stats?.providersNeedingReview || 0) > 10
                  ? "warning"
                  : "success"
              }
              testId="kpi-review-queue"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {statusLoading ? (
          <Card className="border-card-border">
            <CardContent className="p-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ) : (
          <StatusPieChart data={statusBreakdown || []} />
        )}
        {confidenceLoading ? (
          <Card className="border-card-border">
            <CardContent className="p-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ) : (
          <ConfidenceBarChart data={confidenceDistribution || []} />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivityCard activities={recentActivities} />
        <ProcessingMetricsCard metrics={processingMetrics} />
      </div>

      <Card className="border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/upload">
              <Button variant="outline" data-testid="action-upload-csv">
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV
              </Button>
            </Link>
            <Link href="/review">
              <Button variant="outline" data-testid="action-review-queue">
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Review Queue
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline" data-testid="action-download-report">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </Link>
            <Link href="/providers">
              <Button variant="outline" data-testid="action-view-providers">
                <Users className="w-4 h-4 mr-2" />
                View All Providers
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
