"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VideoSource } from "@/types/course";

interface VideoUploaderProps {
  value: string;
  source: VideoSource | null;
  onChange: (url: string, source: VideoSource) => void;
  label?: string;
}

function detectVideoSource(url: string): VideoSource {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    if (host === "youtube.com" || host === "www.youtube.com" || host === "youtu.be")
      return "youtube";
    if (host === "vimeo.com" || host === "www.vimeo.com") return "vimeo";
    if (host.endsWith(".storage.googleapis.com") || host === "storage.googleapis.com" || host.endsWith(".r2.cloudflarestorage.com"))
      return "gcs";
    return "external";
  } catch {
    return "external";
  }
}

export function VideoUploader({
  value,
  onChange,
  label = "Video URL",
}: VideoUploaderProps) {
  const [url, setUrl] = useState(value || "");

  const handleChange = (newUrl: string) => {
    setUrl(newUrl);
    const source = detectVideoSource(newUrl);
    onChange(newUrl, source);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="video-url">{label}</Label>
      <div className="relative">
        <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        <Input
          id="video-url"
          type="url"
          placeholder="Paste a YouTube, Vimeo, or video URL..."
          value={url}
          onChange={(e) => handleChange(e.target.value)}
          className="pl-10"
          aria-label={label}
        />
      </div>
      {url && isValidVideoEmbed(url) && (
        <div className="mt-3 aspect-video w-full overflow-hidden rounded-lg bg-surface-container-high">
          <VideoPreview url={url} />
        </div>
      )}
      <p className="text-xs text-on-surface-variant">
        Paste a YouTube, Vimeo, or direct video link. File upload coming in Phase 2.
      </p>
    </div>
  );
}

function isValidVideoEmbed(url: string): boolean {
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
    <video
      src={url}
      controls
      className="h-full w-full object-contain"
      preload="metadata"
    >
      <track kind="captions" />
    </video>
  );
}
