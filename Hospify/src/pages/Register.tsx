import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, ArrowLeft } from "lucide-react";
import patternBg from "@/assets/pattern-bg.jpg";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "admin">("client");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(name, email, password, role);
    navigate(role === "admin" ? "/admin" : "/dashboard");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0">
        <img src={patternBg} alt="" className="h-full w-full object-cover" loading="lazy" width={800} height={800} />
        <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
      </div>
      
      <div className="floating-blob top-20 right-10 h-48 w-48 bg-accent/20" />
      <div className="floating-blob bottom-20 left-10 h-36 w-36 bg-secondary/15" style={{ animationDelay: "3s" }} />
      
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
              MedCare
            </Link>
            <CardTitle className="font-heading text-2xl">Create Account</CardTitle>
            <CardDescription>Start managing your health today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex gap-1.5 rounded-xl bg-muted/50 p-1.5">
                <button
                  type="button"
                  onClick={() => setRole("client")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${role === "client" ? "bg-card text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                >
                  🏥 Patient
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${role === "admin" ? "bg-card text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                >
                  ⚙️ Admin
                </button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11" />
              </div>
              <Button type="submit" className="h-11 w-full text-base shadow-sm">Create Account</Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-accent hover:underline">Sign in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
