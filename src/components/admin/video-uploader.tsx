"use client";

import { useState, useRef, useCallback } from "react";
import { Link2, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@clerk/nextjs";
import { API_URL } from "@/lib/api/fetch";
import type { VideoSource } from "@/types/course";

interface VideoUploaderProps {
  value: string;
  source: VideoSource | null;
  onChange: (url: string, source: VideoSource) => void;
  label?: string;
}

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number; fileName: string }
  | { status: "done"; cdnUrl: string; fileName: string }
  | { status: "error"; message: string };

function detectVideoSource(url: string): VideoSource {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    if (host === "youtube.com" || host === "www.youtube.com" || host === "youtu.be")
      return "youtube";
    if (host === "vimeo.com" || host === "www.vimeo.com") return "vimeo";
    if (host.endsWith(".b-cdn.net") || host === "iframe.mediadelivery.net")
      return "bunny";
    if (
      host.endsWith(".storage.googleapis.com") ||
      host === "storage.googleapis.com" ||
      host.endsWith(".r2.cloudflarestorage.com")
    )
      return "gcs";
    return "external";
  } catch {
    return "external";
  }
}

const MAX_FILE_SIZE_MB = 500;

export function VideoUploader({
  value,
  onChange,
  label = "Video",
}: VideoUploaderProps) {
  const [url, setUrl] = useState(value || "");
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const { getToken } = useAuth();

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    onChange(newUrl, detectVideoSource(newUrl));
  };

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setUploadState({
          status: "error",
          message: `File exceeds ${MAX_FILE_SIZE_MB} MB limit.`,
        });
        return;
      }

      setUploadState({ status: "uploading", progress: 0, fileName: file.name });

      try {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");

        const title = file.name.replace(/\.[^.]+$/, "");
        const uploadUrl = `${API_URL}/api/admin/upload/video?title=${encodeURIComponent(title)}`;

        const cdnUrl = await new Promise<string>((resolve, reject) => {
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
                resolve(json.data.cdn_url);
              } catch {
                reject(new Error("Invalid response from server"));
              }
            } else {
              try {
                const json = JSON.parse(xhr.responseText);
                reject(new Error(json?.error?.message || `Upload failed (HTTP ${xhr.status})`));
              } catch {
                reject(new Error(`Upload failed (HTTP ${xhr.status})`));
              }
            }
          });

          xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
          xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

          xhr.open("POST", uploadUrl);
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
          xhr.send(file);
        });

        setUploadState({ status: "done", cdnUrl, fileName: file.name });
        setUrl(cdnUrl);
        onChange(cdnUrl, "bunny");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setUploadState({ status: "error", message });
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Tabs defaultValue="url">
        <TabsList className="mb-3">
          <TabsTrigger value="url">
            <Link2 className="mr-1.5 h-3.5 w-3.5" />
            URL
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Upload File
          </TabsTrigger>
        </TabsList>

        {/* URL tab */}
        <TabsContent value="url" className="space-y-3">
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <Input
              id="video-url"
              type="url"
              placeholder="Paste a YouTube, Vimeo, or direct video URL..."
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="pl-10"
              aria-label={label}
            />
          </div>
          {url && isValidUrl(url) && (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-surface-container-high">
              <VideoPreview url={url} />
            </div>
          )}
          <p className="text-xs text-on-surface-variant">
            YouTube, Vimeo, direct MP4, or Bunny.net CDN URLs supported.
          </p>
        </TabsContent>

        {/* Upload file tab */}
        <TabsContent value="upload">
          {uploadState.status === "idle" && (
            <div
              className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-outline-variant p-8 text-center transition-colors hover:border-primary hover:bg-surface-container-low"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload video file"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
              }}
            >
              <Upload className="h-8 w-8 text-on-surface-variant" />
              <div>
                <p className="text-sm font-medium text-on-surface">
                  Drop a video file here, or click to browse
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  MP4, MOV, AVI — up to {MAX_FILE_SIZE_MB} MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
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
                Uploading to server… {uploadState.progress}%
              </p>
            </div>
          )}

          {uploadState.status === "done" && (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-emerald-800">
                  {uploadState.fileName}
                </p>
                <p className="text-xs text-emerald-700">
                  Uploaded — Bunny.net is transcoding to HLS (takes a few minutes)
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset} aria-label="Upload a different file">
                Change
              </Button>
            </div>
          )}

          {uploadState.status === "error" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                <p className="text-sm text-red-800">{uploadState.message}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Try again
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

function VideoPreview({ url }: { url: string }) {
  const youtubeId = getYouTubeId(url);
  if (youtubeId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}`}
        className="h-full w-full"
        allowFullScreen
        title="Video preview"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-same-origin allow-scripts allow-presentation allow-popups"
      />
    );
  }

  const vimeoId = getVimeoId(url);
  if (vimeoId) {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${vimeoId}`}
        className="h-full w-full"
        allowFullScreen
        title="Video preview"
        allow="autoplay; fullscreen; picture-in-picture"
        sandbox="allow-same-origin allow-scripts allow-presentation allow-popups"
      />
    );
  }

  return (
    <video src={url} controls className="h-full w-full object-contain" preload="metadata">
      <track kind="captions" />
    </video>
  );
}
