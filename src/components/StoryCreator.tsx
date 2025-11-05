import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import CharacterForm from "./CharacterForm";
import { toast } from "sonner";
import { Sparkles, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface Character {
  id: string;
  name: string;
  gender: string;
  role: string;
  imageUrl: string;
}

const StoryCreator = () => {
  const navigate = useNavigate();
  const [storyTitle, setStoryTitle] = useState("");
  const [storyDescription, setStoryDescription] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCharacter = (character: Character) => {
    if (characters.length >= 4) {
      toast.error("Maximum 4 characters allowed");
      return;
    }
    setCharacters([...characters, character]);
    toast.success("Character added successfully!");
  };

  const handleRemoveCharacter = (id: string) => {
    setCharacters(characters.filter(char => char.id !== id));
    toast.success("Character removed");
  };

  const handleGenerateSlides = async () => {
    if (!storyTitle || !storyDescription) {
      toast.error("Please provide story title and description");
      return;
    }

    if (characters.length === 0) {
      toast.error("Please add at least one character");
      return;
    }

    if (!backgroundUrl) {
      toast.error("Please upload a background image");
      return;
    }

    setIsGenerating(true);
    toast.info("Generating your animated slides with AI...");
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create story record
      const { data: storyData, error: storyError } = await supabase
        .from("stories")
        .insert({
          user_id: user.id,
          title: storyTitle,
          description: storyDescription,
          background_url: backgroundUrl,
        })
        .select()
        .single();

      if (storyError) throw storyError;

      // Insert characters
      const charactersToInsert = characters.map(char => ({
        story_id: storyData.id,
        name: char.name,
        gender: char.gender,
        role: char.role,
        image_url: char.imageUrl,
        age: "N/A",
      }));

      const { error: charError } = await supabase
        .from("characters")
        .insert(charactersToInsert);

      if (charError) throw charError;

      // Call edge function to generate slides
      const { data, error } = await supabase.functions.invoke('generate-video', {
        body: {
          storyId: storyData.id,
          storyTitle,
          storyDescription,
          characters,
          backgroundUrl,
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Slides generated successfully!");
        navigate("/my-stories");
      } else {
        throw new Error(data?.error || "Failed to generate slides");
      }
    } catch (error) {
      console.error('Slide generation error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate slides");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-glass">
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
            Create Your Story
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Story Title</Label>
            <Input
              id="title"
              placeholder="Enter your story title..."
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              className="bg-muted/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Story Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your story..."
              value={storyDescription}
              onChange={(e) => setStoryDescription(e.target.value)}
              className="min-h-[150px] bg-muted/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="background">Background Image</Label>
            <div className="flex gap-4 items-start">
              <Input
                id="background"
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="bg-muted/50 border-border/50"
              />
              {backgroundUrl && (
                <img
                  src={backgroundUrl}
                  alt="Background preview"
                  className="w-32 h-20 object-cover rounded-lg border border-border/50"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Characters
            </span>
            <span className="text-sm text-muted-foreground">
              ({characters.length}/4)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CharacterForm onAddCharacter={handleAddCharacter} />
          
          {characters.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {characters.map((character) => (
                <Card key={character.id} className="border-border/50 bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {character.imageUrl && (
                        <img
                          src={character.imageUrl}
                          alt={character.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-foreground">{character.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {character.gender}
                        </p>
                        <p className="text-sm text-accent">{character.role}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveCharacter(character.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={handleGenerateSlides}
          disabled={isGenerating}
          className="bg-gradient-primary hover:opacity-90 transition-all hover:shadow-glow gap-2"
          size="lg"
        >
          <Sparkles className="w-5 h-5" />
          {isGenerating ? "Generating..." : "Generate Animated Slides"}
        </Button>
      </div>
    </div>
  );
};

export default StoryCreator;
