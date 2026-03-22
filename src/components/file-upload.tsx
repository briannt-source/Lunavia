"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, File } from "lucide-react";
import { useTranslations } from "next-intl";

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  label?: string;
}

export function FileUpload({
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 10,
  accept = "*/*",
  label = "Upload files",
}: FileUploadProps) {
  const t = useTranslations("Components.FileUpload");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setError("");

    if (files.length + selectedFiles.length > maxFiles) {
      setError(t("tooManyFiles", { maxFiles }));
      return;
    }

    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > maxSizeMB * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      setError(t("fileTooLarge", { maxSizeMB, names: oversizedFiles.map((f) => f.name).join(", ") }));
      return;
    }

    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="border-2 border-dashed rounded-lg p-4">
        <input ref={fileInputRef} type="file" multiple accept={accept} onChange={handleFileSelect} className="hidden" />
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-center">
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              {t("chooseFile")}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              {t("maxFilesHint", { maxFiles, maxSizeMB })}
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </div>
    </div>
  );
}
