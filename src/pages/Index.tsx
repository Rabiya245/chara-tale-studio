import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Users, Video, Wand2, Mail } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              StoryViz AI
            </h1>
            <div className="flex gap-6 items-center">
              <a href="#home" className="text-foreground hover:text-primary transition-colors">
                Home
              </a>
              <a href="#explore" className="text-foreground hover:text-primary transition-colors">
                Explore
              </a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors">
                About Us
              </a>
              <a href="#scope" className="text-foreground hover:text-primary transition-colors">
                Scope
              </a>
              <Link to="/auth">
                <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
                  Start Creating
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-5xl md:text-7xl font-bold">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Bring Your Stories
              </span>
              <br />
              <span className="text-foreground">To Life with AI</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create stunning animated videos with personalized characters. Simply describe your story,
              add your characters, and let our AI transform it into a beautiful animated narrative.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2 shadow-glow">
                  <Sparkles className="w-5 h-5" />
                  Start Creating Free
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Section */}
      <section id="explore" className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-12 bg-gradient-primary bg-clip-text text-transparent">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-border shadow-card hover:shadow-glow transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-semibold text-foreground">Add Characters</h4>
                <p className="text-muted-foreground">
                  Create up to 4 unique characters with custom details, roles, and upload their images.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-card hover:shadow-glow transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-semibold text-foreground">Write Your Story</h4>
                <p className="text-muted-foreground">
                  Describe your narrative through text or audio input. Our AI understands your creative vision.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-card hover:shadow-glow transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-semibold text-foreground">Generate Video</h4>
                <p className="text-muted-foreground">
                  Watch as AI transforms your story into an animated video with your personalized characters.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-12 bg-gradient-primary bg-clip-text text-transparent">
            About Our Team
          </h3>
          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8">
            <Card className="border-border shadow-card">
              <CardContent className="p-6 space-y-3">
                <h4 className="text-xl font-semibold text-foreground">Samiksha</h4>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:samiksha2218@gmail.com" className="hover:text-primary transition-colors">
                    samiksha2218@gmail.com
                  </a>
                </div>
                <p className="text-muted-foreground">
                  Co-founder passionate about bringing AI-powered storytelling to everyone.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-card">
              <CardContent className="p-6 space-y-3">
                <h4 className="text-xl font-semibold text-foreground">Rabiya Basheera</h4>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:rabiyabasheera245@gmail.com" className="hover:text-primary transition-colors">
                    rabiyabasheera245@gmail.com
                  </a>
                </div>
                <p className="text-muted-foreground">
                  Co-founder dedicated to making creative tools accessible through technology.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Scope Section */}
      <section id="scope" className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-12 bg-gradient-primary bg-clip-text text-transparent">
            Project Scope
          </h3>
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-border shadow-card">
              <CardContent className="p-6">
                <h4 className="text-xl font-semibold text-foreground mb-3">Current Features</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ User authentication and secure account management</li>
                  <li>✓ Personalized character creation (up to 4 characters)</li>
                  <li>✓ Text and audio story input</li>
                  <li>✓ AI-powered video generation</li>
                  <li>✓ Download and save functionality</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border shadow-card">
              <CardContent className="p-6">
                <h4 className="text-xl font-semibold text-foreground mb-3">Future Enhancements</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>→ Advanced character customization</li>
                  <li>→ Multiple animation styles</li>
                  <li>→ Voice synthesis for characters</li>
                  <li>→ Collaborative storytelling</li>
                  <li>→ Story templates and themes</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 StoryViz AI. Empowering storytellers with AI technology.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
