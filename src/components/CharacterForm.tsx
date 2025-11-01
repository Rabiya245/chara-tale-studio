import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Upload } from "lucide-react";
import { Character } from "./StoryCreator";
import { toast } from "sonner";

interface CharacterFormProps {
  onAddCharacter: (character: Character) => void;
}

const CharacterForm = ({ onAddCharacter }: CharacterFormProps) => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [role, setRole] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !gender || !role) {
      toast.error("Please fill in all character details");
      return;
    }

    const newCharacter: Character = {
      id: Date.now().toString(),
      name,
      gender,
      role,
      imageUrl,
    };

    onAddCharacter(newCharacter);
    
    // Reset form
    setName("");
    setGender("");
    setRole("");
    setImageUrl("");
  };

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Character Name</Label>
              <Input
                id="name"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-muted border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                placeholder="e.g., Hero, Villain"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-muted border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Character Image</Label>
            <div className="flex items-center gap-4">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="bg-muted border-border"
              />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity gap-2">
            <Plus className="w-4 h-4" />
            Add Character
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CharacterForm;
