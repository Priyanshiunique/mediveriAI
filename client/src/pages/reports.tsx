import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, ConfidenceBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  Filter,
  BarChart3,
} from "lucide-react";
import type { Provider, DashboardStats, ProviderStatusType } from "@shared/schema";

export default function Reports() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>("validation");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: providers = [], isLoading: providersLoading } = useQuery<Provider[]>({
    queryKey: ["/api/providers"],
  });

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const filteredProviders = providers.filter((p) => {
    return statusFilter === "all" || p.status === statusFilter;
  });

  const handleExportCSV = async () => {
    try {
      const response = await fetch(
        `/api/reports/providers/csv?status=${statusFilter}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `validation_report_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Export complete", description: "CSV report downloaded" });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to generate CSV report",
        variant: "destructive",
      });
    }
  };

  const reportSummary = [
    { label: "Total Records", value: providers.length },
    { label: "Verified", value: providers.filter((p) => p.status === "verified").length },
    { label: "Flagged", value: providers.filter((p) => p.status === "flagged").length },
    { label: "Pending", value: providers.filter((p) => p.status === "pending").length },
    {
      label: "Avg. Confidence",
      value: `${(
        providers.reduce((acc, p) => acc + (p.overallConfidence || 0), 0) /
        Math.max(providers.length, 1)
      ).toFixed(1)}%`,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download validation reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px]" data-testid="select-report-type">
              <BarChart3 className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="validation">Validation Report</SelectItem>
              <SelectItem value="summary">Summary Report</SelectItem>
              <SelectItem value="flagged">Flagged Providers</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportCSV} data-testid="button-export-report">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {reportSummary.map((item, index) => (
          <Card key={index} className="border-card-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-semibold mt-1">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-card-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                Validation Report Preview
              </CardTitle>
              <CardDescription>
                Review data before exporting. Showing {filteredProviders.length} records.
              </CardDescription>
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NPI</TableHead>
                  <TableHead>Provider Name</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Last Validated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providersLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredProviders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-muted-foreground">No providers match the filter</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProviders.slice(0, 20).map((provider) => (
                    <TableRow key={provider.id} data-testid={`report-row-${provider.id}`}>
                      <TableCell>
                        <span className="font-mono text-sm">{provider.npi}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {provider.firstName} {provider.lastName}
                        </span>
                        {provider.credential && (
                          <span className="text-muted-foreground">, {provider.credential}</span>
                        )}
                      </TableCell>
                      <TableCell>{provider.specialty || "-"}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{provider.phone || "-"}</span>
                      </TableCell>
                      <TableCell>
                        {provider.city && provider.state
                          ? `${provider.city}, ${provider.state}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={provider.status as ProviderStatusType} />
                      </TableCell>
                      <TableCell>
                        <ConfidenceBadge confidence={provider.overallConfidence || 0} />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {provider.lastValidated
                            ? new Date(provider.lastValidated).toLocaleDateString()
                            : "-"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filteredProviders.length > 20 && (
            <div className="px-6 py-4 border-t text-sm text-muted-foreground text-center">
              Showing 20 of {filteredProviders.length} records. Export to see all.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Available Export Formats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-chart-2/10 shrink-0">
                <FileSpreadsheet className="w-5 h-5 text-chart-2" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">CSV Export</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Comma-separated values file compatible with Excel, Google Sheets, and
                  other spreadsheet applications.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={handleExportCSV}
                  data-testid="button-download-csv"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">PDF Report</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Formatted PDF document with charts, tables, and summary statistics for
                  presentation and compliance.
                </p>
                <Badge variant="outline" className="mt-3">Coming Soon</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
