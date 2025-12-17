import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, ConfidenceBadge } from "@/components/status-badge";
import { ConfidenceIndicator, FieldConfidenceRow } from "@/components/confidence-indicator";
import {
  User,
  Phone,
  MapPin,
  Building2,
  FileCheck,
  Mail,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import type { Provider, ProviderStatusType, FieldConfidence } from "@shared/schema";

interface ProviderDetailModalProps {
  provider: Provider | null;
  isOpen: boolean;
  onClose: () => void;
  onRevalidate: (provider: Provider) => void;
  onApprove: (provider: Provider) => void;
  onFlag: (provider: Provider) => void;
  onSendEmail: (provider: Provider) => void;
}

export function ProviderDetailModal({
  provider,
  isOpen,
  onClose,
  onRevalidate,
  onApprove,
  onFlag,
  onSendEmail,
}: ProviderDetailModalProps) {
  if (!provider) return null;

  const fieldConfidences = (provider.fieldConfidences as Record<string, FieldConfidence>) || {};

  const formatPhone = (phone: string | null) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getFieldData = (fieldName: string, value: string | null) => {
    const fieldConf = fieldConfidences[fieldName];
    return {
      value: value,
      confidence: fieldConf?.confidence || 0,
      source: fieldConf?.source || "csv_upload",
      hasDiscrepancy: (fieldConf?.discrepancies?.length || 0) > 0,
    };
  };

  const contactFields = [
    { name: "phone", value: formatPhone(provider.phone) },
    { name: "fax", value: formatPhone(provider.fax) },
    { name: "email", value: provider.email },
  ];

  const addressFields = [
    { name: "addressLine1", value: provider.addressLine1 },
    { name: "addressLine2", value: provider.addressLine2 },
    { name: "city", value: provider.city },
    { name: "state", value: provider.state },
    { name: "zipCode", value: provider.zipCode },
  ];

  const credentialFields = [
    { name: "npi", value: provider.npi },
    { name: "credential", value: provider.credential },
    { name: "specialty", value: provider.specialty },
    { name: "taxonomyCode", value: provider.taxonomyCode },
    { name: "licenseNumber", value: provider.licenseNumber },
    { name: "licenseState", value: provider.licenseState },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {provider.firstName} {provider.lastName}
                  {provider.credential && <span className="text-muted-foreground">, {provider.credential}</span>}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  NPI: <span className="font-mono">{provider.npi}</span>
                  {provider.specialty && ` • ${provider.specialty}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={provider.status as ProviderStatusType} />
              <ConfidenceBadge confidence={provider.overallConfidence || 0} />
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="validation" data-testid="tab-validation">Validation Details</TabsTrigger>
                <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="border-card-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      {contactFields.map((field) => {
                        const data = getFieldData(field.name, field.value);
                        return (
                          <FieldConfidenceRow
                            key={field.name}
                            fieldName={field.name}
                            value={data.value}
                            confidence={data.confidence}
                            source={data.source}
                            hasDiscrepancy={data.hasDiscrepancy}
                          />
                        );
                      })}
                    </CardContent>
                  </Card>

                  <Card className="border-card-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      {addressFields.map((field) => {
                        const data = getFieldData(field.name, field.value);
                        return (
                          <FieldConfidenceRow
                            key={field.name}
                            fieldName={field.name}
                            value={data.value}
                            confidence={data.confidence}
                            source={data.source}
                            hasDiscrepancy={data.hasDiscrepancy}
                          />
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-card-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-primary" />
                      Credentials & Licensing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-1 md:grid-cols-2">
                    {credentialFields.map((field) => {
                      const data = getFieldData(field.name, field.value);
                      return (
                        <FieldConfidenceRow
                          key={field.name}
                          fieldName={field.name}
                          value={data.value}
                          confidence={data.confidence}
                          source={data.source}
                          hasDiscrepancy={data.hasDiscrepancy}
                        />
                      );
                    })}
                  </CardContent>
                </Card>

                {provider.organizationName && (
                  <Card className="border-card-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        Organization
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">{provider.organizationName}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="validation" className="mt-6 space-y-6">
                <Card className="border-card-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Confidence Score Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">Overall Confidence</p>
                          <p className="text-sm text-muted-foreground">
                            Weighted average of all field scores
                          </p>
                        </div>
                        <ConfidenceIndicator
                          confidence={provider.overallConfidence || 0}
                          size="lg"
                          className="w-32"
                        />
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">Field Scores</h4>
                        {Object.entries(fieldConfidences).map(([field, conf]) => (
                          <div key={field} className="flex items-center justify-between py-2">
                            <span className="text-sm capitalize">
                              {field.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <ConfidenceIndicator
                              confidence={(conf as FieldConfidence).confidence || 0}
                              size="sm"
                              className="w-24"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {provider.validationNotes && (
                  <Card className="border-card-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Validation Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {provider.validationNotes}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <Card className="border-card-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Validation History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted shrink-0">
                          <RefreshCw className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Record Created</p>
                          <p className="text-xs text-muted-foreground">
                            {provider.createdAt
                              ? new Date(provider.createdAt).toLocaleString()
                              : "Unknown"}
                          </p>
                        </div>
                      </div>
                      {provider.lastValidated && (
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-chart-2/10 shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-chart-2" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Last Validated</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(provider.lastValidated).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between gap-4 p-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} data-testid="button-close-modal">
            Close
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onRevalidate(provider)}
              data-testid="button-revalidate"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Revalidate
            </Button>
            <Button
              variant="outline"
              onClick={() => onSendEmail(provider)}
              data-testid="button-send-email"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
            {provider.status === "flagged" && (
              <Button onClick={() => onApprove(provider)} data-testid="button-approve">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve
              </Button>
            )}
            {provider.status === "verified" && (
              <Button
                variant="destructive"
                onClick={() => onFlag(provider)}
                data-testid="button-flag"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Flag for Review
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
