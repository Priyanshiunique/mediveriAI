import { useMutation } from "@tanstack/react-query";
import { FileUpload } from "@/components/file-upload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { FileSpreadsheet, FileText, Database, Play, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function Upload() {
  const { toast } = useToast();
  const [uploadedCount, setUploadedCount] = useState(0);

  const uploadCSVMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload/csv", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setUploadedCount((prev) => prev + (data.count || 0));
      toast({
        title: "CSV uploaded",
        description: `${data.count || 0} providers imported successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to process CSV file",
        variant: "destructive",
      });
    },
  });

  const uploadPDFMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload/pdf", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      toast({
        title: "PDF processed",
        description: `Extracted ${data.extractedCount || 0} provider records`,
      });
    },
    onError: () => {
      toast({
        title: "PDF processing failed",
        description: "Failed to extract data from PDF",
        variant: "destructive",
      });
    },
  });

  const generateSyntheticMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/generate-synthetic-data", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Generation failed");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Data generated",
        description: `${data.count || 200} synthetic provider records created`,
      });
    },
    onError: () => {
      toast({
        title: "Generation failed",
        description: "Failed to generate synthetic data",
        variant: "destructive",
      });
    },
  });

  const validateAllMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/providers/validate-all", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Validation failed");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/review-queue"] });
      toast({
        title: "Validation complete",
        description: `Validated ${data.processed || 0} providers`,
      });
    },
    onError: () => {
      toast({
        title: "Validation failed",
        description: "Failed to validate providers",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Upload Data</h1>
        <p className="text-muted-foreground">
          Import provider data from CSV files or extract from PDF documents
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              CSV Upload
            </CardTitle>
            <CardDescription>
              Upload CSV files containing provider directory data. Expected columns: NPI,
              First Name, Last Name, Phone, Address, etc.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              accept=".csv"
              maxSize={10 * 1024 * 1024}
              onUpload={async (file) => {
                await uploadCSVMutation.mutateAsync(file);
              }}
              title="Drop CSV file here"
              description="or click to browse"
              icon={<FileSpreadsheet className="w-6 h-6 text-primary" />}
            />
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary" />
              PDF Upload
            </CardTitle>
            <CardDescription>
              Upload scanned PDF documents for OCR extraction. AI will extract provider
              details automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              accept=".pdf"
              maxSize={20 * 1024 * 1024}
              onUpload={async (file) => {
                await uploadPDFMutation.mutateAsync(file);
              }}
              title="Drop PDF file here"
              description="or click to browse"
              icon={<FileText className="w-6 h-6 text-primary" />}
            />
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="w-5 h-5 text-primary" />
            Demo Data Generation
          </CardTitle>
          <CardDescription>
            Generate synthetic provider data with realistic data quality issues for demo
            purposes. Creates 200 provider records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              onClick={() => generateSyntheticMutation.mutate()}
              disabled={generateSyntheticMutation.isPending}
              data-testid="button-generate-synthetic"
            >
              <Database className="w-4 h-4 mr-2" />
              {generateSyntheticMutation.isPending
                ? "Generating..."
                : "Generate 200 Providers"}
            </Button>
            <Button
              variant="outline"
              onClick={() => validateAllMutation.mutate()}
              disabled={validateAllMutation.isPending}
              data-testid="button-validate-all"
            >
              <Play className="w-4 h-4 mr-2" />
              {validateAllMutation.isPending ? "Validating..." : "Run Validation Pipeline"}
            </Button>
          </div>
          {uploadedCount > 0 && (
            <div className="flex items-center gap-2 mt-4 text-sm text-chart-2">
              <CheckCircle2 className="w-4 h-4" />
              {uploadedCount} providers imported in this session
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-card-border bg-muted/30">
        <CardContent className="p-6">
          <h3 className="font-medium mb-3">Expected CSV Format</h3>
          <div className="overflow-x-auto">
            <table className="text-sm font-mono">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="pr-4 text-left">NPI</th>
                  <th className="pr-4 text-left">First Name</th>
                  <th className="pr-4 text-left">Last Name</th>
                  <th className="pr-4 text-left">Phone</th>
                  <th className="pr-4 text-left">Email</th>
                  <th className="pr-4 text-left">Address</th>
                  <th className="pr-4 text-left">City</th>
                  <th className="pr-4 text-left">State</th>
                  <th className="text-left">ZIP</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-muted-foreground/70">
                  <td className="pr-4">1234567890</td>
                  <td className="pr-4">John</td>
                  <td className="pr-4">Smith</td>
                  <td className="pr-4">555-123-4567</td>
                  <td className="pr-4">john@example.com</td>
                  <td className="pr-4">123 Main St</td>
                  <td className="pr-4">New York</td>
                  <td className="pr-4">NY</td>
                  <td>10001</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
