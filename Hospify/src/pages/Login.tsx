import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Heart, ArrowLeft } from "lucide-react";
import patternBg from "@/assets/pattern-bg.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login(email, password);
      toast({
        title: "Welcome back",
        description: `Signed in as ${user.fullName}.`,
      });
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={patternBg} alt="" className="h-full w-full object-cover" loading="lazy" width={800} height={800} />
        <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
      </div>

      {/* Floating orbs */}
      <div className="floating-blob top-20 left-10 h-48 w-48 bg-accent/20" />
      <div className="floating-blob bottom-20 right-10 h-36 w-36 bg-secondary/15" style={{ animationDelay: "3s" }} />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted/70 hover:text-muted transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <Card className="glass-card overflow-hidden border-0 shadow-2xl">
          <CardHeader className="pb-4 text-center">
            <Link to="/" className="mx-auto mb-3 flex items-center gap-2.5 font-heading text-xl font-bold text-primary">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-sm">
                <Heart className="h-5 w-5" />
              </div>
              Hospify
            </Link>
            <CardTitle className="font-heading text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="patient@hospify.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11" />
              </div>
              <Button type="submit" className="h-11 w-full text-base shadow-sm" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="font-semibold text-accent hover:underline">Sign up</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
