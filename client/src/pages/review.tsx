import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ReviewQueueTable } from "@/components/review-queue-table";
import { ProviderDetailModal } from "@/components/provider-detail-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Provider, ReviewQueueItem } from "@shared/schema";

export default function ReviewQueue() {
  const { toast } = useToast();
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);

  const { data: reviewItems = [], isLoading } = useQuery<
    (ReviewQueueItem & { provider?: Provider })[]
  >({
    queryKey: ["/api/review-queue"],
  });

  const { data: providers = [] } = useQuery<Provider[]>({
    queryKey: ["/api/providers"],
  });

  const selectedProvider = providers.find((p) => p.id === selectedProviderId) || null;

  const approveMutation = useMutation({
    mutationFn: (itemId: string) =>
      apiRequest("PATCH", `/api/review-queue/${itemId}`, { status: "approved" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Item approved", description: "Provider status updated" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (itemId: string) =>
      apiRequest("PATCH", `/api/review-queue/${itemId}`, { status: "rejected" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/review-queue"] });
      toast({ title: "Item rejected", description: "Item removed from queue" });
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: (itemIds: string[]) =>
      apiRequest("POST", "/api/review-queue/bulk-approve", { itemIds }),
    onSuccess: (_, itemIds) => {
      queryClient.invalidateQueries({ queryKey: ["/api/review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Items approved",
        description: `${itemIds.length} items approved successfully`,
      });
    },
  });

  const bulkRejectMutation = useMutation({
    mutationFn: (itemIds: string[]) =>
      apiRequest("POST", "/api/review-queue/bulk-reject", { itemIds }),
    onSuccess: (_, itemIds) => {
      queryClient.invalidateQueries({ queryKey: ["/api/review-queue"] });
      toast({
        title: "Items rejected",
        description: `${itemIds.length} items rejected`,
      });
    },
  });

  const validateMutation = useMutation({
    mutationFn: (providerId: string) =>
      apiRequest("POST", `/api/providers/${providerId}/validate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      toast({ title: "Validation started", description: "Provider is being revalidated" });
    },
  });

  const updateProviderMutation = useMutation({
    mutationFn: ({ providerId, data }: { providerId: string; data: Partial<Provider> }) =>
      apiRequest("PATCH", `/api/providers/${providerId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/review-queue"] });
      toast({ title: "Provider updated", description: "Status updated successfully" });
      setSelectedProviderId(null);
    },
  });

  const handleViewProvider = (providerId: string) => {
    setSelectedProviderId(providerId);
  };

  const handleApprove = (itemId: string) => {
    approveMutation.mutate(itemId);
  };

  const handleReject = (itemId: string) => {
    rejectMutation.mutate(itemId);
  };

  const handleBulkApprove = (itemIds: string[]) => {
    bulkApproveMutation.mutate(itemIds);
  };

  const handleBulkReject = (itemIds: string[]) => {
    bulkRejectMutation.mutate(itemIds);
  };

  const handleRevalidate = (provider: Provider) => {
    validateMutation.mutate(provider.id);
    setSelectedProviderId(null);
  };

  const handleApproveProvider = (provider: Provider) => {
    updateProviderMutation.mutate({ providerId: provider.id, data: { status: "verified" } });
  };

  const handleFlagProvider = (provider: Provider) => {
    updateProviderMutation.mutate({ providerId: provider.id, data: { status: "flagged" } });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Review Queue</h1>
        <p className="text-muted-foreground">
          Providers flagged for manual verification
        </p>
      </div>

      <ReviewQueueTable
        items={reviewItems}
        isLoading={isLoading}
        onViewProvider={handleViewProvider}
        onApprove={handleApprove}
        onReject={handleReject}
        onBulkApprove={handleBulkApprove}
        onBulkReject={handleBulkReject}
      />

      <ProviderDetailModal
        provider={selectedProvider}
        isOpen={!!selectedProvider}
        onClose={() => setSelectedProviderId(null)}
        onRevalidate={handleRevalidate}
        onApprove={handleApproveProvider}
        onFlag={handleFlagProvider}
        onSendEmail={() => {}}
      />
    </div>
  );
}
