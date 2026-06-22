import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";

import patternBg from "@/assets/pattern-bg.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface VerifyOtpLocationState {
  email?: string;
}

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();
  const { toast } = useToast();
  const locationState = location.state as VerifyOtpLocationState | null;

  const [email, setEmail] = useState(locationState?.email ?? "");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await verifyOtp(email, otp);
      toast({
        title: "Account verified",
        description: "You can now sign in to Hospify.",
      });
      navigate("/login", { replace: true });
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Please check the OTP and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0">
        <img src={patternBg} alt="" className="h-full w-full object-cover" loading="lazy" width={800} height={800} />
        <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
      </div>

      <div className="floating-blob top-20 left-10 h-48 w-48 bg-accent/20" />
      <div className="floating-blob bottom-20 right-10 h-36 w-36 bg-secondary/15" style={{ animationDelay: "3s" }} />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <Link to="/register" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted/70 hover:text-muted transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to registration
        </Link>

        <Card className="glass-card overflow-hidden border-0 shadow-2xl">
          <CardHeader className="pb-4 text-center">
            <Link to="/" className="mx-auto mb-3 flex items-center gap-2.5 font-heading text-xl font-bold text-primary">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-sm">
                <Heart className="h-5 w-5" />
              </div>
              Hospify
            </Link>
            <CardTitle className="font-heading text-2xl">Verify Your Account</CardTitle>
            <CardDescription>Enter the 6-digit OTP generated for your Hospify account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="patient@hospify.com" value={email} onChange={(event) => setEmail(event.target.value)} required className="h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Verification OTP</Label>
                <InputOTP id="otp" maxLength={6} value={otp} onChange={setOtp} containerClassName="justify-center">
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot key={index} index={index} className="h-11 w-11 bg-card/70" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button type="submit" className="h-11 w-full text-base shadow-sm" disabled={isLoading || otp.length !== 6}>
                {isLoading ? "Verifying..." : "Verify Account"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already verified?{" "}
                <Link to="/login" className="font-semibold text-accent hover:underline">Sign in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
