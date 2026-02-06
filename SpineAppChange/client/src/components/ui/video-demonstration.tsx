import { useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

interface VideoDemonstrationProps {
  title: string;
  videoSrc: string;
  description?: string;
  className?: string;
}

export function VideoDemonstration({
  title,
  videoSrc,
  description,
  className,
}: VideoDemonstrationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null
  );

  const togglePlay = () => {
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const restart = () => {
    if (videoElement) {
      videoElement.currentTime = 0;
      videoElement.play();
      setIsPlaying(true);
    }
  };

  return (
    <Card
      className={`bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 ${className}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-blue-800">
          {title}
        </CardTitle>
        {description && <p className="text-sm text-blue-600">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="relative rounded-lg overflow-hidden bg-black">
          <video
            ref={setVideoElement}
            src={videoSrc}
            className="w-full h-48 object-cover"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            controls={false}
            playsInline
          />

          {/* Custom video controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center justify-center space-x-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={togglePlay}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={restart}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-3 text-center">
          <p className="text-xs text-blue-600 font-medium">
            Reference Demonstration
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
