"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, User } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (url: string) => void;
  label?: string;
}

export function AvatarUpload({
  currentAvatar,
  onAvatarChange,
  label = "Avatar",
}: AvatarUploadProps) {
  const t = useTranslations("Components.AvatarUpload");
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files are accepted");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image file must not exceed 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.urls && data.urls.length > 0) {
          onAvatarChange(data.urls[0]);
        }
      } else {
        alert("Error uploading image");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = () => {
    setPreview(null);
    onAvatarChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
          {preview ? (
            <Image src={preview} alt="Avatar preview" fill className="object-cover" />
          ) : (
            <User className="h-12 w-12 text-gray-400" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? t("uploading") : t("choosePhoto")}
          </Button>
          {preview && (
            <Button type="button" variant="ghost" size="sm" onClick={removeAvatar}>
              <X className="h-4 w-4 mr-2" />
              {t("remove")}
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{t("hint")}</p>
    </div>
  );
}
