import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Play, Pause } from "lucide-react";
import { Character } from "./StoryCreator";

interface Scene {
  scene: number;
  description: string;
  duration: number;
  characters: string[];
}

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
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const animationRef = useRef<number>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  // Parse scenes from AI response
  useEffect(() => {
    try {
      const scenesText = videoData.scenes;
      // Try to extract JSON from the AI response
      const jsonMatch = scenesText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedScenes = JSON.parse(jsonMatch[0]);
        setScenes(parsedScenes);
      } else {
        // Fallback: create simple scenes from description
        const words = videoData.description.split(' ');
        const chunkSize = Math.ceil(words.length / 5);
        const defaultScenes = Array.from({ length: 5 }, (_, i) => ({
          scene: i + 1,
          description: words.slice(i * chunkSize, (i + 1) * chunkSize).join(' '),
          duration: 6,
          characters: videoData.characters.map(c => c.name)
        }));
        setScenes(defaultScenes);
      }
    } catch (error) {
      console.error('Error parsing scenes:', error);
    }
  }, [videoData]);

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
      
      if (startTimeRef.current === 0) {
        startTimeRef.current = timestamp;
      }
      
      const elapsedTime = (timestamp - startTimeRef.current) / 1000;

      // Clear canvas
      ctx.fillStyle = '#0A0F29';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dynamic gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      const hue = (elapsedTime * 20) % 360;
      gradient.addColorStop(0, `hsl(${hue}, 70%, 30%)`);
      gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 70%, 40%)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate current scene
      let timeIntoScenes = elapsedTime;
      let sceneIndex = 0;
      if (scenes.length > 0) {
        for (let i = 0; i < scenes.length; i++) {
          if (timeIntoScenes < scenes[i].duration) {
            sceneIndex = i;
            break;
          }
          timeIntoScenes -= scenes[i].duration;
        }
        setCurrentSceneIndex(sceneIndex);
      }

      const currentScene = scenes[sceneIndex] || null;
      const sceneProgress = currentScene ? timeIntoScenes / currentScene.duration : 0;

      // Draw scene description box
      if (currentScene) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(50, 50, canvas.width - 100, 120);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Scene ${currentScene.scene}`, 80, 90);
        
        ctx.font = '18px Arial';
        const maxWidth = canvas.width - 160;
        const words = currentScene.description.split(' ');
        let line = '';
        let y = 125;
        
        for (const word of words) {
          const testLine = line + word + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && line !== '') {
            ctx.fillText(line, 80, y);
            line = word + ' ';
            y += 25;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 80, y);
      }

      // Animate characters based on scene
      videoData.characters.forEach((char, index) => {
        const baseX = (canvas.width / (videoData.characters.length + 1)) * (index + 1);
        const baseY = canvas.height / 2 + 100;
        
        // Create different animations based on scene progress
        let x = baseX;
        let y = baseY;
        let scale = 1;
        let rotation = 0;

        // Entrance animation at scene start
        if (sceneProgress < 0.15) {
          const entranceProgress = sceneProgress / 0.15;
          y = baseY + (canvas.height - baseY) * (1 - entranceProgress);
          scale = 0.5 + 0.5 * entranceProgress;
        } else {
          // Movement during scene
          const moveProgress = (sceneProgress - 0.15) / 0.85;
          x = baseX + Math.sin(elapsedTime * 2 + index) * 80;
          y = baseY + Math.cos(elapsedTime * 1.5 + index) * 40;
          scale = 1 + Math.sin(elapsedTime * 3 + index) * 0.1;
          rotation = Math.sin(elapsedTime + index) * 0.1;
        }

        const imgSize = 150 * scale;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // Draw character image if loaded
        if (characterImages[index]) {
          // Create circular clip for character image
          ctx.beginPath();
          ctx.arc(0, 0, imgSize / 2, 0, Math.PI * 2);
          ctx.clip();
          
          // Draw the character image
          ctx.drawImage(
            characterImages[index]!,
            -imgSize / 2,
            -imgSize / 2,
            imgSize,
            imgSize
          );
          
          ctx.restore();
          
          // Draw animated border
          ctx.save();
          ctx.translate(x, y);
          ctx.beginPath();
          ctx.arc(0, 0, imgSize / 2, 0, Math.PI * 2);
          ctx.strokeStyle = `hsl(${(elapsedTime * 50 + index * 60) % 360}, 70%, 60%)`;
          ctx.lineWidth = 5;
          ctx.stroke();
          ctx.restore();
        } else {
          // Fallback circle if image not loaded
          ctx.beginPath();
          ctx.arc(0, 0, imgSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${(index * 360) / videoData.characters.length}, 70%, 60%)`;
          ctx.fill();
          ctx.restore();
        }

        // Draw character name with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(char.name, x, y + imgSize / 2 + 30);
        ctx.shadowBlur = 0;
        
        // Draw character role
        ctx.font = '16px Arial';
        ctx.fillStyle = '#e0e0e0';
        ctx.fillText(char.role, x, y + imgSize / 2 + 52);
      });

      // Update time
      setCurrentTime(elapsedTime);

      if (elapsedTime < videoData.duration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
        startTimeRef.current = 0;
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
    if (!isPlaying) {
      startTimeRef.current = 0;
    }
    setIsPlaying(!isPlaying);
  };

  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    recordedChunksRef.current = [];
    startTimeRef.current = 0;
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
      startTimeRef.current = 0;
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

        {scenes.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <strong>Scene Breakdown ({scenes.length} scenes):</strong>
            <div className="mt-2 space-y-2">
              {scenes.map((scene, index) => (
                <div 
                  key={scene.scene} 
                  className={`p-3 rounded-lg transition-all ${
                    index === currentSceneIndex 
                      ? 'bg-primary/20 border-2 border-primary' 
                      : 'bg-muted'
                  }`}
                >
                  <div className="font-semibold">Scene {scene.scene} ({scene.duration}s)</div>
                  <div className="text-xs mt-1">{scene.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
