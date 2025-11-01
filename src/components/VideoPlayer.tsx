import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Play, Pause } from "lucide-react";
import { Character } from "./StoryCreator";

interface VideoPlayerProps {
  videoData: {
    id: string;
    title: string;
    description: string;
    characters: Character[];
    scenes: string;
    duration: number;
  };
}

const VideoPlayer = ({ videoData }: VideoPlayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const animationRef = useRef<number>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1280;
    canvas.height = 720;

    // Load character images
    const characterImages: (HTMLImageElement | null)[] = [];
    let imagesLoaded = 0;
    const totalImages = videoData.characters.filter(char => char.imageUrl).length;

    const checkAllImagesLoaded = () => {
      if (imagesLoaded === totalImages && isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    videoData.characters.forEach((char, index) => {
      if (char.imageUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          imagesLoaded++;
          characterImages[index] = img;
          checkAllImagesLoaded();
        };
        img.onerror = () => {
          console.error(`Failed to load image for ${char.name}`);
          imagesLoaded++;
          characterImages[index] = null;
          checkAllImagesLoaded();
        };
        img.src = char.imageUrl;
      } else {
        characterImages[index] = null;
      }
    });

    const animate = (timestamp: number) => {
      if (!isPlaying) return;

      // Clear canvas
      ctx.fillStyle = '#0A0F29';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#1e3a8a');
      gradient.addColorStop(1, '#7c3aed');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(videoData.title, canvas.width / 2, 100);

      // Draw characters with their actual images
      const time = timestamp / 1000;
      videoData.characters.forEach((char, index) => {
        const x = (canvas.width / (videoData.characters.length + 1)) * (index + 1);
        const y = canvas.height / 2 + Math.sin(time + index) * 50;
        const imgSize = 120;

        // Draw character image if loaded
        if (characterImages[index]) {
          ctx.save();
          
          // Create circular clip for character image
          ctx.beginPath();
          ctx.arc(x, y, imgSize / 2, 0, Math.PI * 2);
          ctx.clip();
          
          // Draw the character image
          ctx.drawImage(
            characterImages[index]!,
            x - imgSize / 2,
            y - imgSize / 2,
            imgSize,
            imgSize
          );
          
          ctx.restore();
          
          // Draw border around character
          ctx.beginPath();
          ctx.arc(x, y, imgSize / 2, 0, Math.PI * 2);
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 4;
          ctx.stroke();
        } else {
          // Fallback circle if image not loaded
          ctx.beginPath();
          ctx.arc(x, y, 60, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${(index * 360) / videoData.characters.length}, 70%, 60%)`;
          ctx.fill();
        }

        // Draw character name with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(char.name, x, y + 100);
        ctx.shadowBlur = 0;
        
        // Draw character role
        ctx.font = '16px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(char.role, x, y + 125);
      });

      // Update time
      setCurrentTime(time % videoData.duration);

      if (time < videoData.duration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    if (isPlaying && totalImages === 0) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, videoData]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    recordedChunksRef.current = [];
    const stream = canvas.captureStream(30); // 30 FPS
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedVideoUrl(url);
      setIsRecording(false);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setIsPlaying(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const downloadVideo = () => {
    if (!recordedVideoUrl) return;

    const link = document.createElement('a');
    link.download = `${videoData.title.replace(/\s+/g, '_')}_video.webm`;
    link.href = recordedVideoUrl;
    link.click();
  };

  return (
    <Card className="border-border shadow-card">
      <CardContent className="p-6 space-y-4">
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg border border-border"
          style={{ aspectRatio: '16/9' }}
        />
        
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {!isRecording ? (
              <>
                <Button onClick={togglePlay} size="lg" className="gap-2">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button onClick={startRecording} variant="default" size="lg" className="gap-2">
                  <Download className="w-5 h-5" />
                  Record Video
                </Button>
              </>
            ) : (
              <Button onClick={stopRecording} variant="destructive" size="lg" className="gap-2">
                Stop Recording
              </Button>
            )}
            
            <div className="text-sm text-muted-foreground">
              {currentTime.toFixed(1)}s / {videoData.duration}s
            </div>
          </div>

          {recordedVideoUrl && (
            <Button onClick={downloadVideo} variant="outline" size="lg" className="gap-2">
              <Download className="w-5 h-5" />
              Download Video
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          <strong>AI Generated Scenes:</strong>
          <pre className="mt-2 p-4 bg-muted rounded-lg overflow-auto max-h-40">
            {videoData.scenes}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
