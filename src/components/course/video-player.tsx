"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type Hls from "hls.js";
import { useUpdateVideoProgress } from "@/hooks/use-courses";

interface VideoPlayerProps {
  url: string;
  courseId: string;
  pageId: string;
  initialProgress?: number;
  initialPosition?: number;
  onProgressUpdate?: (percent: number) => void;
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

function isHLSUrl(url: string): boolean {
  return url.includes(".m3u8");
}

export function VideoPlayer({
  url,
  courseId,
  pageId,
  initialPosition = 0,
  onProgressUpdate,
}: VideoPlayerProps) {
  const youtubeId = getYouTubeId(url);
  const vimeoId = getVimeoId(url);

  if (youtubeId || vimeoId) {
    return (
      <EmbedPlayer
        url={url}
        youtubeId={youtubeId}
        vimeoId={vimeoId}
        onProgressUpdate={onProgressUpdate}
      />
    );
  }

  return (
    <NativePlayer
      url={url}
      courseId={courseId}
      pageId={pageId}
      initialPosition={initialPosition}
      onProgressUpdate={onProgressUpdate}
    />
  );
}

function EmbedPlayer({
  youtubeId,
  vimeoId,
  onProgressUpdate,
}: {
  url: string;
  youtubeId: string | null;
  vimeoId: string | null;
  onProgressUpdate?: (percent: number) => void;
}) {
  // Embedded videos (YouTube/Vimeo) don't expose progress to the parent page
  // due to cross-origin restrictions. Automatically mark as 100% watched
  // so the "Complete and Continue" button is always enabled for embeds.
  useEffect(() => {
    onProgressUpdate?.(100);
  }, [onProgressUpdate]);

  const embedContent = youtubeId ? (
    <iframe
      src={`https://www.youtube.com/embed/${youtubeId}`}
      className="h-full w-full"
      allowFullScreen
      title="Video"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    />
  ) : vimeoId ? (
    <iframe
      src={`https://player.vimeo.com/video/${vimeoId}`}
      className="h-full w-full"
      allowFullScreen
      title="Video"
      allow="autoplay; fullscreen; picture-in-picture"
    />
  ) : null;

  if (!embedContent) return null;

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-surface-container-high">
      {embedContent}
    </div>
  );
}

function NativePlayer({
  url,
  courseId,
  pageId,
  initialPosition,
  onProgressUpdate,
}: {
  url: string;
  courseId: string;
  pageId: string;
  initialPosition: number;
  onProgressUpdate?: (percent: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const updateProgress = useUpdateVideoProgress(courseId, pageId);
  const lastUpdateRef = useRef(0);
  const [isReady, setIsReady] = useState(false);

  // Attach HLS.js for .m3u8 streams; fall back to native src for regular video.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cleanup: (() => void) | undefined;

    if (isHLSUrl(url)) {
      // Dynamic import avoids SSR issues and keeps the initial bundle smaller.
      import("hls.js").then(({ default: HlsClass }) => {
        if (!videoRef.current) return;

        if (HlsClass.isSupported()) {
          const hls = new HlsClass({ startLevel: -1 }); // -1 = auto quality
          hlsRef.current = hls;
          hls.loadSource(url);
          hls.attachMedia(videoRef.current);
        } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
          // Safari natively supports HLS — fall back to setting src directly
          videoRef.current.src = url;
        }
      });

      cleanup = () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    }
    // Non-HLS: src is set as a JSX prop, no imperative setup needed.

    return cleanup;
  }, [url]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const percent = Math.floor((video.currentTime / video.duration) * 100);
    onProgressUpdate?.(percent);

    // Send progress update every 10 seconds
    const now = Date.now();
    if (now - lastUpdateRef.current >= 10000) {
      lastUpdateRef.current = now;
      updateProgress.mutate({
        progressPercent: percent,
        lastPosition: Math.floor(video.currentTime),
      });
    }
  }, [onProgressUpdate, updateProgress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setIsReady(true);
      if (initialPosition > 0 && video.duration > initialPosition) {
        video.currentTime = initialPosition;
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [initialPosition, handleTimeUpdate]);

  const hls = isHLSUrl(url);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-surface-container-high">
      {hls && !isReady && (
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      {/* For HLS: src is undefined — HLS.js attaches the media via the effect.
          For regular URLs: src is set directly so the browser loads it natively. */}
      <video
        ref={videoRef}
        src={hls ? undefined : url}
        controls
        className="h-full w-full object-contain"
        preload="metadata"
        playsInline
        style={{ display: hls && !isReady ? "none" : "block" }}
      >
        <track kind="captions" />
      </video>
    </div>
  );
}
