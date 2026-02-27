import React, { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  src: string;
  title: string;
  onProgress: (progress: number) => void;
  initialProgress?: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  onProgress,
  initialProgress = 0,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(initialProgress);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentProgress = (video.currentTime / video.duration) * 100;
      setProgress(currentProgress);
      onProgress(currentProgress);
    };

    const handleLoadedMetadata = () => {
      if (initialProgress > 0 && !isInitialized) {
        const startTime = (initialProgress / 100) * video.duration;
        video.currentTime = startTime;
        setIsInitialized(true);
        console.log(
          `비디오 시작 위치 설정: ${startTime.toFixed(2)}초 (${initialProgress}%)`,
        );
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [onProgress, initialProgress, isInitialized]);

  return (
    <div className="relative w-full">
      <video
        ref={videoRef}
        className="w-full rounded-lg"
        controls
        controlsList="nodownload"
        playsInline
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="mt-2">
        <div className="text-sm font-medium">{title}</div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        {initialProgress > 0 && !isInitialized && (
          <div className="text-xs text-gray-500 mt-1">
            이전에 {initialProgress.toFixed(0)}% 시청했습니다. 이어서
            시청합니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
