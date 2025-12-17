import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge, ConfidenceBadge } from "@/components/status-badge";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Mail, 
  MoreHorizontal,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Provider, ProviderStatusType } from "@shared/schema";

interface ProviderTableProps {
  providers: Provider[];
  isLoading?: boolean;
  onViewProvider: (provider: Provider) => void;
  onEmailProvider: (provider: Provider) => void;
}

export function ProviderTable({
  providers,
  isLoading,
  onViewProvider,
  onEmailProvider,
}: ProviderTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>("lastName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 10;

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      searchTerm === "" ||
      provider.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.npi.includes(searchTerm) ||
      provider.specialty?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || provider.status === statusFilter;

    const matchesConfidence =
      confidenceFilter === "all" ||
      (confidenceFilter === "high" && (provider.overallConfidence || 0) >= 90) ||
      (confidenceFilter === "medium" &&
        (provider.overallConfidence || 0) >= 70 &&
        (provider.overallConfidence || 0) < 90) ||
      (confidenceFilter === "low" && (provider.overallConfidence || 0) < 70);

    return matchesSearch && matchesStatus && matchesConfidence;
  });

  const sortedProviders = [...filteredProviders].sort((a, b) => {
    let aVal = a[sortField as keyof Provider] || "";
    let bVal = b[sortField as keyof Provider] || "";
    
    if (sortField === "overallConfidence") {
      aVal = a.overallConfidence || 0;
      bVal = b.overallConfidence || 0;
    }
    
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc" 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    }
    
    return sortDirection === "asc" 
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  const totalPages = Math.ceil(sortedProviders.length / itemsPerPage);
  const paginatedProviders = sortedProviders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 font-medium"
      onClick={() => handleSort(field)}
      data-testid={`sort-${field}`}
    >
      {children}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
              data-testid="input-search-providers"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
                <Filter className="h-4 w-4 mr-2" />
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
            <Select
              value={confidenceFilter}
              onValueChange={(value) => {
                setConfidenceFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]" data-testid="select-confidence-filter">
                <SelectValue placeholder="Confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="high">High (90%+)</SelectItem>
                <SelectItem value="medium">Medium (70-89%)</SelectItem>
                <SelectItem value="low">Low (&lt;70%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <SortableHeader field="npi">NPI</SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader field="lastName">Name</SortableHeader>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <SortableHeader field="specialty">Specialty</SortableHeader>
                </TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <SortableHeader field="overallConfidence">Confidence</SortableHeader>
                </TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="h-10 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedProviders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">No providers found</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProviders.map((provider) => (
                  <TableRow 
                    key={provider.id} 
                    className="hover-elevate cursor-pointer"
                    onClick={() => onViewProvider(provider)}
                    data-testid={`row-provider-${provider.id}`}
                  >
                    <TableCell>
                      <span className="font-mono text-sm">{provider.npi}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {provider.firstName} {provider.lastName}
                          {provider.credential && (
                            <span className="text-muted-foreground">, {provider.credential}</span>
                          )}
                        </p>
                        {provider.organizationName && (
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {provider.organizationName}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm">{provider.specialty || "-"}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm">
                        {provider.city && provider.state
                          ? `${provider.city}, ${provider.state}`
                          : "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={provider.status as ProviderStatusType} />
                    </TableCell>
                    <TableCell>
                      <ConfidenceBadge confidence={provider.overallConfidence || 0} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" data-testid={`button-actions-${provider.id}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewProvider(provider);
                            }}
                            data-testid={`action-view-${provider.id}`}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onEmailProvider(provider);
                            }}
                            data-testid={`action-email-${provider.id}`}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, sortedProviders.length)} of{" "}
              {sortedProviders.length} providers
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
