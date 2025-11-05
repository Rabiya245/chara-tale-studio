import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Sparkles, Users, Wand2, Download } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-cinematic">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Story Visualization
          </h1>
          <div className="hidden md:flex gap-6">
            <a href="#home" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#possibilities" className="text-muted-foreground hover:text-foreground transition-colors">
              Explore
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About Us
            </a>
          </div>
          <Link to="/auth">
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
              Start Creating
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="container mx-auto px-4 py-20 md:py-32 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <h2 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Story Visualization with Personalized Character
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Transform your ideas into AI-animated stories with your own characters
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-all hover:shadow-glow">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Creating Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
              <BookOpen className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-fade-in">
          <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            How It Works
          </h3>
          <p className="text-xl text-muted-foreground">
            Create stunning animated stories in 7 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { step: 1, icon: Users, title: "Create Account", desc: "Sign up with email and password" },
            { step: 2, icon: BookOpen, title: "Enter Story Title", desc: "Give your story a captivating name" },
            { step: 3, icon: Wand2, title: "Add Story Description", desc: "Describe your story in detail" },
            { step: 4, icon: Users, title: "Add Characters", desc: "Upload up to 4 character images" },
            { step: 5, icon: Sparkles, title: "Upload Background", desc: "Choose your scene background" },
            { step: 6, icon: Download, title: "Generate Slides", desc: "AI creates 4 animated slides" },
            { step: 7, icon: BookOpen, title: "Download & Share", desc: "Get slides and story scripts" },
          ].map((feature, i) => (
            <Card
              key={i}
              className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glass transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    {feature.step}
                  </div>
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-foreground">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Explore Possibilities */}
      <section id="possibilities" className="container mx-auto px-4 py-20 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Explore Possibilities
          </h3>
          <p className="text-xl text-muted-foreground">
            Unlimited creativity for everyone
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { title: "For Educators", desc: "Create engaging educational content with visual storytelling" },
            { title: "For Creators", desc: "Bring your creative visions to life with AI-powered animation" },
            { title: "For Children", desc: "Make learning fun with personalized animated stories" },
            { title: "For Everyone", desc: "Express yourself through unique animated narratives" },
          ].map((card, i) => (
            <Card
              key={i}
              className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-8 text-center space-y-4">
                <h4 className="text-2xl font-bold text-primary">{card.title}</h4>
                <p className="text-muted-foreground">{card.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Endless Scopes */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h3 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Endless Scopes
          </h3>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              Our platform empowers users to transform their imagination into reality through AI-powered storytelling.
            </p>
            <p>
              Whether you're an educator creating immersive learning experiences, a content creator developing unique narratives,
              or a parent crafting personalized stories for your children, our tool adapts to your needs.
            </p>
            <p>
              Use it for education, entertainment, marketing, or pure creative expression. The possibilities are limitless.
            </p>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="container mx-auto px-4 py-20 bg-gradient-to-b from-transparent via-secondary/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h3 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            About Us
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glass transition-all">
              <CardContent className="p-8 space-y-4">
                <h4 className="text-2xl font-bold text-foreground">Samiksha</h4>
                <a
                  href="mailto:samiksha2218@gmail.com"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  samiksha2218@gmail.com
                </a>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glass transition-all">
              <CardContent className="p-8 space-y-4">
                <h4 className="text-2xl font-bold text-foreground">Rabiya Basheera</h4>
                <a
                  href="mailto:rabiyabasheera245@gmail.com"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  rabiyabasheera245@gmail.com
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-lg mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 Story Visualization. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
