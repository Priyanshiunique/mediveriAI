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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriorityBadge, ConfidenceBadge } from "@/components/status-badge";
import {
  Eye,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  ClipboardCheck,
} from "lucide-react";
import type { Provider, ReviewQueueItem, PriorityLevelType } from "@shared/schema";

interface ReviewQueueTableProps {
  items: (ReviewQueueItem & { provider?: Provider })[];
  isLoading?: boolean;
  onViewProvider: (providerId: string) => void;
  onApprove: (itemId: string) => void;
  onReject: (itemId: string) => void;
  onBulkApprove: (itemIds: string[]) => void;
  onBulkReject: (itemIds: string[]) => void;
}

export function ReviewQueueTable({
  items,
  isLoading,
  onViewProvider,
  onApprove,
  onReject,
  onBulkApprove,
  onBulkReject,
}: ReviewQueueTableProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>("priority");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 10;

  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const filteredItems = items.filter((item) => {
    return priorityFilter === "all" || item.priority === priorityFilter;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortField === "priority") {
      const aOrder = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
      const bOrder = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
      return sortDirection === "asc" ? aOrder - bOrder : bOrder - aOrder;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(paginatedItems.map((item) => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const allSelected =
    paginatedItems.length > 0 &&
    paginatedItems.every((item) => selectedItems.has(item.id));

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Review Queue
            {items.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({items.length} items)
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={priorityFilter}
              onValueChange={(value) => {
                setPriorityFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]" data-testid="select-priority-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            {selectedItems.size > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    onBulkApprove(Array.from(selectedItems));
                    setSelectedItems(new Set());
                  }}
                  data-testid="button-bulk-approve"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Approve ({selectedItems.size})
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    onBulkReject(Array.from(selectedItems));
                    setSelectedItems(new Set());
                  }}
                  data-testid="button-bulk-reject"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject ({selectedItems.size})
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                    data-testid="checkbox-select-all"
                  />
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-medium"
                    onClick={() => handleSort("priority")}
                    data-testid="sort-priority"
                  >
                    Priority
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="hidden md:table-cell">Reason</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="w-[140px]">Actions</TableHead>
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
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-chart-2" />
                      <p className="text-muted-foreground">No items in review queue</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id} data-testid={`row-review-${item.id}`}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={(checked) =>
                          handleSelectItem(item.id, checked as boolean)
                        }
                        aria-label={`Select item ${item.id}`}
                        data-testid={`checkbox-item-${item.id}`}
                      />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={item.priority as PriorityLevelType} />
                    </TableCell>
                    <TableCell>
                      {item.provider ? (
                        <div>
                          <p className="font-medium">
                            {item.provider.firstName} {item.provider.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            NPI: {item.provider.npi}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Provider not found</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">
                        {item.reason}
                      </p>
                    </TableCell>
                    <TableCell>
                      {item.provider && (
                        <ConfidenceBadge confidence={item.provider.overallConfidence || 0} />
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewProvider(item.providerId)}
                          data-testid={`button-view-${item.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onApprove(item.id)}
                          data-testid={`button-approve-${item.id}`}
                        >
                          <CheckCircle2 className="w-4 h-4 text-chart-2" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onReject(item.id)}
                          data-testid={`button-reject-${item.id}`}
                        >
                          <XCircle className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
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
              {Math.min(currentPage * itemsPerPage, sortedItems.length)} of{" "}
              {sortedItems.length} items
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
