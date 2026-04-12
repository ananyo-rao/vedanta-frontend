"use client";

import { useState, useRef, useCallback } from "react";
import { ImageIcon, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@clerk/nextjs";
import { API_URL } from "@/lib/api/fetch";
import NextImage from "next/image";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number; fileName: string }
  | { status: "done"; url: string; fileName: string }
  | { status: "error"; message: string };

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function ImageUploader({
  value,
  onChange,
  label = "Thumbnail Image",
}: ImageUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>(
    value ? { status: "done", url: value, fileName: "current thumbnail" } : { status: "idle" }
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const { getToken } = useAuth();

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setUploadState({
          status: "error",
          message: "Only JPEG, PNG, and WebP images are accepted.",
        });
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setUploadState({
          status: "error",
          message: `Image exceeds ${MAX_FILE_SIZE_MB} MB limit.`,
        });
        return;
      }

      setUploadState({ status: "uploading", progress: 0, fileName: file.name });

      try {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");

        const uploadUrl = `${API_URL}/api/admin/upload/image?filename=${encodeURIComponent(file.name)}`;

        const url = await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhrRef.current = xhr;

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const percent = Math.floor((e.loaded / e.total) * 100);
              setUploadState((prev) =>
                prev.status === "uploading" ? { ...prev, progress: percent } : prev
              );
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const json = JSON.parse(xhr.responseText);
                resolve(json.data.url);
              } catch {
                reject(new Error("Invalid response from server"));
              }
            } else {
              try {
                const json = JSON.parse(xhr.responseText);
                reject(
                  new Error(json?.error?.message || `Upload failed (HTTP ${xhr.status})`)
                );
              } catch {
                reject(new Error(`Upload failed (HTTP ${xhr.status})`));
              }
            }
          });

          xhr.addEventListener("error", () =>
            reject(new Error("Network error during upload"))
          );
          xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

          xhr.open("POST", uploadUrl);
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        setUploadState({ status: "done", url, fileName: file.name });
        onChange(url);
      } catch (err) {
        setUploadState({
          status: "error",
          message: err instanceof Error ? err.message : "Upload failed",
        });
      }
    },
    [getToken, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleCancel = () => {
    xhrRef.current?.abort();
    setUploadState({ status: "idle" });
  };

  const handleReset = () => {
    setUploadState({ status: "idle" });
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {uploadState.status === "idle" && (
        <div
          className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-outline-variant p-8 text-center transition-colors hover:border-primary hover:bg-surface-container-low"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload thumbnail image"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
        >
          <ImageIcon className="h-8 w-8 text-on-surface-variant" />
          <div>
            <p className="text-sm font-medium text-on-surface">
              Drop an image here, or click to browse
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              JPEG, PNG, WebP — up to {MAX_FILE_SIZE_MB} MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            aria-hidden
          />
        </div>
      )}

      {uploadState.status === "uploading" && (
        <div className="space-y-3 rounded-lg border border-outline-variant p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm text-on-surface">{uploadState.fileName}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              aria-label="Cancel upload"
              className="h-7 w-7 shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={uploadState.progress} className="h-2" aria-label="Upload progress" />
          <p className="text-xs text-on-surface-variant">
            Uploading… {uploadState.progress}%
          </p>
        </div>
      )}

      {uploadState.status === "done" && (
        <div className="space-y-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-container-high">
            <NextImage
              src={uploadState.url}
              alt="Thumbnail preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-on-surface-variant">Thumbnail uploaded</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Change
            </Button>
          </div>
        </div>
      )}

      {uploadState.status === "error" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <p className="text-sm text-red-800">{uploadState.message}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUploadState({ status: "idle" })}
          >
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
