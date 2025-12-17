import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ProviderTable } from "@/components/provider-table";
import { ProviderDetailModal } from "@/components/provider-detail-modal";
import { EmailDraftModal } from "@/components/email-draft-modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { RefreshCw, Download, Upload } from "lucide-react";
import { Link } from "wouter";
import type { Provider, EmailDraft } from "@shared/schema";

export default function Providers() {
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [emailProvider, setEmailProvider] = useState<Provider | null>(null);
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);

  const { data: providers = [], isLoading, refetch } = useQuery<Provider[]>({
    queryKey: ["/api/providers"],
  });

  const validateMutation = useMutation({
    mutationFn: (providerId: string) =>
      apiRequest("POST", `/api/providers/${providerId}/validate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      toast({ title: "Validation started", description: "Provider is being revalidated" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (providerId: string) =>
      apiRequest("PATCH", `/api/providers/${providerId}`, { status: "verified" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      toast({ title: "Provider approved", description: "Status updated to verified" });
      setSelectedProvider(null);
    },
  });

  const flagMutation = useMutation({
    mutationFn: (providerId: string) =>
      apiRequest("PATCH", `/api/providers/${providerId}`, { status: "flagged" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      toast({ title: "Provider flagged", description: "Provider added to review queue" });
      setSelectedProvider(null);
    },
  });

  const generateEmailMutation = useMutation({
    mutationFn: (providerId: string) =>
      apiRequest("POST", `/api/providers/${providerId}/email-draft`),
    onSuccess: (data: EmailDraft) => {
      setEmailDraft(data);
    },
  });

  const handleViewProvider = (provider: Provider) => {
    setSelectedProvider(provider);
  };

  const handleEmailProvider = async (provider: Provider) => {
    setEmailProvider(provider);
    await generateEmailMutation.mutateAsync(provider.id);
  };

  const handleRevalidate = (provider: Provider) => {
    validateMutation.mutate(provider.id);
    setSelectedProvider(null);
  };

  const handleApprove = (provider: Provider) => {
    approveMutation.mutate(provider.id);
  };

  const handleFlag = (provider: Provider) => {
    flagMutation.mutate(provider.id);
  };

  const handleSendEmail = (draft: { subject: string; body: string; recipientEmail: string }) => {
    toast({
      title: "Email drafted",
      description: "Email draft saved. You can copy and send via your email client.",
    });
    setEmailProvider(null);
    setEmailDraft(null);
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/reports/providers/csv");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `providers_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Export complete", description: "CSV file downloaded" });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to download CSV file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Providers</h1>
          <p className="text-muted-foreground">
            Manage and validate healthcare provider directory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            data-testid="button-refresh-providers"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            data-testid="button-export-csv"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Link href="/upload">
            <Button size="sm" data-testid="button-upload-providers">
              <Upload className="w-4 h-4 mr-2" />
              Upload Data
            </Button>
          </Link>
        </div>
      </div>

      <ProviderTable
        providers={providers}
        isLoading={isLoading}
        onViewProvider={handleViewProvider}
        onEmailProvider={handleEmailProvider}
      />

      <ProviderDetailModal
        provider={selectedProvider}
        isOpen={!!selectedProvider}
        onClose={() => setSelectedProvider(null)}
        onRevalidate={handleRevalidate}
        onApprove={handleApprove}
        onFlag={handleFlag}
        onSendEmail={handleEmailProvider}
      />

      <EmailDraftModal
        provider={emailProvider}
        draft={emailDraft}
        isOpen={!!emailProvider}
        onClose={() => {
          setEmailProvider(null);
          setEmailDraft(null);
        }}
        onSend={handleSendEmail}
        isLoading={generateEmailMutation.isPending}
      />
    </div>
  );
}
