import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, ArrowLeft, Download } from "lucide-react";

interface Story {
  id: string;
  title: string;
  description: string;
  background_url: string | null;
  created_at: string;
  slides: Slide[];
}

interface Slide {
  id: string;
  slide_number: number;
  image_url: string;
  script: string;
}

const MyStories = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (storiesError) throw storiesError;

      if (storiesData) {
        const storiesWithSlides = await Promise.all(
          storiesData.map(async (story) => {
            const { data: slidesData } = await supabase
              .from("slides")
              .select("*")
              .eq("story_id", story.id)
              .order("slide_number");

            return {
              ...story,
              slides: slidesData || [],
            };
          })
        );

        setStories(storiesWithSlides);
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error("Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (storyId: string) => {
    try {
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId);

      if (error) throw error;

      toast.success("Story deleted successfully");
      fetchStories();
    } catch (error) {
      console.error("Error deleting story:", error);
      toast.error("Failed to delete story");
    }
  };

  const downloadScript = (script: string, storyTitle: string, slideNumber: number) => {
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storyTitle}_slide_${slideNumber}_script.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cinematic flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cinematic py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="border-border/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              My Stories
            </h1>
          </div>
        </div>

        {stories.length === 0 ? (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <p className="text-xl text-muted-foreground mb-6">
                You haven't created any stories yet
              </p>
              <Button onClick={() => navigate("/dashboard")} className="bg-gradient-primary">
                Create Your First Story
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {stories.map((story) => (
              <Card
                key={story.id}
                className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glass transition-all"
              >
                <CardHeader className="border-b border-border/50">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
                        {story.title}
                      </CardTitle>
                      <p className="text-muted-foreground">{story.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(story.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(story.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {story.slides.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {story.slides.map((slide) => (
                        <Card key={slide.id} className="border-border/50 bg-muted/30">
                          <CardContent className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-semibold text-primary">
                                Slide {slide.slide_number}
                              </h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadScript(slide.script, story.title, slide.slide_number)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Script
                              </Button>
                            </div>
                            <img
                              src={slide.image_url}
                              alt={`Slide ${slide.slide_number}`}
                              className="w-full rounded-lg aspect-video object-cover"
                            />
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {slide.script}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No slides generated yet
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyStories;
