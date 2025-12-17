import { useCallback, useState } from "react";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  accept: string;
  maxSize?: number;
  onUpload: (file: File) => Promise<void>;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface UploadedFile {
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
}

export function FileUpload({
  accept,
  maxSize = 10 * 1024 * 1024,
  onUpload,
  title,
  description,
  icon,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    if (file.size > maxSize) {
      setUploadedFiles((prev) => [
        ...prev,
        { file, status: "error", progress: 0, error: "File too large" },
      ]);
      return;
    }

    const fileEntry: UploadedFile = {
      file,
      status: "uploading",
      progress: 0,
    };

    setUploadedFiles((prev) => [...prev, fileEntry]);

    try {
      const progressInterval = setInterval(() => {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.file === file && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          )
        );
      }, 100);

      await onUpload(file);

      clearInterval(progressInterval);

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.file === file ? { ...f, status: "success", progress: 100 } : f
        )
      );
    } catch (error) {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? { ...f, status: "error", error: "Upload failed" }
            : f
        )
      );
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      files.forEach(processFile);
    },
    [onUpload, maxSize]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(processFile);
    e.target.value = "";
  };

  const removeFile = (file: File) => {
    setUploadedFiles((prev) => prev.filter((f) => f.file !== file));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 transition-colors duration-200 cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          multiple
          data-testid="input-file-upload"
        />
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            {icon || <Upload className="w-6 h-6 text-primary" />}
          </div>
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <Button variant="outline" size="sm" className="mt-2" data-testid="button-browse-files">
            Browse Files
          </Button>
          <p className="text-xs text-muted-foreground">
            Max file size: {formatFileSize(maxSize)}
          </p>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((item, index) => (
            <Card key={`${item.file.name}-${index}`} className="border-card-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted shrink-0">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{item.file.name}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.status === "uploading" && (
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        )}
                        {item.status === "success" && (
                          <CheckCircle2 className="w-4 h-4 text-chart-2" />
                        )}
                        {item.status === "error" && (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(item.file)}
                          data-testid={`button-remove-file-${index}`}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(item.file.size)}
                      </span>
                      {item.status === "error" && (
                        <span className="text-xs text-destructive">{item.error}</span>
                      )}
                    </div>
                    {item.status === "uploading" && (
                      <Progress value={item.progress} className="h-1 mt-2" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
