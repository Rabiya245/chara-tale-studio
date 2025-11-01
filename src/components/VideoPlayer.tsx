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

      // Analyze scene for actions and animate characters accordingly
      const sceneDescription = currentScene?.description.toLowerCase() || '';
      const actionKeywords = {
        walk: ['walk', 'walking', 'moved', 'approaching', 'stepped'],
        talk: ['said', 'asked', 'replied', 'spoke', 'told', 'exclaimed'],
        run: ['ran', 'running', 'rushed', 'hurried'],
        jump: ['jump', 'jumped', 'leaped'],
        sit: ['sit', 'sitting', 'sat'],
        stand: ['stand', 'standing', 'stood'],
        look: ['look', 'looking', 'gazed', 'stared'],
        fight: ['fight', 'fighting', 'attacked', 'battle'],
        celebrate: ['celebrate', 'celebrated', 'cheered', 'happy', 'victory']
      };

      // Detect actions in scene
      const detectedActions: string[] = [];
      Object.entries(actionKeywords).forEach(([action, keywords]) => {
        if (keywords.some(keyword => sceneDescription.includes(keyword))) {
          detectedActions.push(action);
        }
      });

      // Animate characters based on their role in the scene and detected actions
      videoData.characters.forEach((char, index) => {
        const isInScene = currentScene?.characters.includes(char.name);
        const charNameInScene = sceneDescription.includes(char.name.toLowerCase());
        
        // Base positioning
        const baseX = (canvas.width / (videoData.characters.length + 1)) * (index + 1);
        const baseY = canvas.height - 250;
        
        let x = baseX;
        let y = baseY;
        let scale = 1;
        let opacity = isInScene ? 1 : 0.3;

        // Scene entrance animation
        if (sceneProgress < 0.2) {
          const entranceProgress = sceneProgress / 0.2;
          if (isInScene) {
            y = canvas.height + (baseY - canvas.height) * entranceProgress;
            opacity = entranceProgress;
          }
        } else {
          // Action-based animations
          const actionTime = (sceneProgress - 0.2) / 0.8;
          
          if (charNameInScene || isInScene) {
            // Walking animation
            if (detectedActions.includes('walk')) {
              x = baseX + Math.sin(elapsedTime * 4) * 30;
              y = baseY + Math.abs(Math.sin(elapsedTime * 8)) * 10;
            }
            
            // Running animation
            if (detectedActions.includes('run')) {
              x = baseX + Math.sin(elapsedTime * 6) * 50;
              y = baseY + Math.abs(Math.sin(elapsedTime * 12)) * 15;
            }
            
            // Jumping animation
            if (detectedActions.includes('jump')) {
              const jumpPhase = (elapsedTime * 2) % 2;
              if (jumpPhase < 1) {
                y = baseY - Math.sin(jumpPhase * Math.PI) * 100;
              }
            }
            
            // Talking animation (subtle head movement)
            if (detectedActions.includes('talk')) {
              scale = 1 + Math.sin(elapsedTime * 8) * 0.05;
            }
            
            // Celebration animation
            if (detectedActions.includes('celebrate')) {
              y = baseY + Math.sin(elapsedTime * 5) * 20;
              scale = 1 + Math.sin(elapsedTime * 4) * 0.15;
            }
            
            // Fighting animation
            if (detectedActions.includes('fight')) {
              x = baseX + Math.sin(elapsedTime * 10) * 40;
              scale = 1 + Math.abs(Math.sin(elapsedTime * 10)) * 0.2;
            }
          }
        }

        const imgSize = 200 * scale;

        // Draw character image
        if (characterImages[index]) {
          ctx.save();
          ctx.globalAlpha = opacity;
          
          // Shadow for depth
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 20;
          ctx.shadowOffsetY = 10;
          
          ctx.drawImage(
            characterImages[index]!,
            x - imgSize / 2,
            y - imgSize / 2,
            imgSize,
            imgSize
          );
          
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;
          
          // Draw character name if active in scene
          if (isInScene || charNameInScene) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4;
            ctx.strokeText(char.name, x, y + imgSize / 2 + 40);
            ctx.fillText(char.name, x, y + imgSize / 2 + 40);
          }
          
          ctx.restore();
        } else {
          // Fallback shape
          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.fillStyle = `hsl(${(index * 360) / videoData.characters.length}, 70%, 60%)`;
          ctx.fillRect(x - imgSize / 2, y - imgSize / 2, imgSize, imgSize);
          ctx.restore();
        }
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
