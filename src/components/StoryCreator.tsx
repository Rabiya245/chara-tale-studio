import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import CharacterForm from "./CharacterForm";
import { toast } from "sonner";
import { Sparkles, Download, Save } from "lucide-react";

export interface Character {
  id: string;
  name: string;
  age: string;
  gender: string;
  role: string;
  imageUrl: string;
}

const StoryCreator = () => {
  const [storyTitle, setStoryTitle] = useState("");
  const [storyDescription, setStoryDescription] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGenerateVideo = async () => {
    if (!storyTitle || !storyDescription) {
      toast.error("Please provide story title and description");
      return;
    }

    if (characters.length === 0) {
      toast.error("Please add at least one character");
      return;
    }

    setIsGenerating(true);
    toast.info("AI video generation will be implemented soon!");
    
    // Placeholder for AI generation
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Video generation complete! (Demo)");
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card className="border-border shadow-card">
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
              className="bg-muted border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Story Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your story... (You can also use audio input - coming soon)"
              value={storyDescription}
              onChange={(e) => setStoryDescription(e.target.value)}
              className="min-h-[150px] bg-muted border-border"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-card">
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
                <Card key={character.id} className="border-border bg-muted">
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
                          {character.age} years • {character.gender}
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

      <div className="flex gap-4 justify-center">
        <Button
          onClick={handleGenerateVideo}
          disabled={isGenerating}
          className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2"
          size="lg"
        >
          <Sparkles className="w-5 h-5" />
          {isGenerating ? "Generating..." : "Generate Video"}
        </Button>
        
        <Button variant="outline" size="lg" className="gap-2">
          <Save className="w-5 h-5" />
          Save Draft
        </Button>
        
        <Button variant="outline" size="lg" className="gap-2">
          <Download className="w-5 h-5" />
          Download
        </Button>
      </div>
    </div>
  );
};

export default StoryCreator;
