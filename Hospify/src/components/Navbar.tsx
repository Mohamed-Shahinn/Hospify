import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-card/90 backdrop-blur-xl shadow-sm border-b" : "bg-transparent border-b border-transparent"}`}>
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-heading text-xl font-bold text-primary">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-sm">
            <Heart className="h-5 w-5" />
          </div>
          Hospify
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {!isAuthenticated ? (
            <>
              <Link to="/" className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">Home</Link>
              <Link to="/#features" className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">Features</Link>
              <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">Login</Link>
              <Button size="sm" className="ml-2 shadow-sm" onClick={() => navigate("/register")}>Get Started</Button>
            </>
          ) : (
            <>
              <Link to={role === "admin" ? "/admin" : "/dashboard"} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">Dashboard</Link>
              {role === "patient" && (
                <Link to="/book-appointment" className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">Book Appointment</Link>
              )}
              <Button size="sm" variant="outline" className="ml-2" onClick={handleLogout}>Logout</Button>
            </>
          )}
        </div>

        <button className="md:hidden rounded-lg p-2 hover:bg-muted/50 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-card/95 backdrop-blur-xl p-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-1">
            {!isAuthenticated ? (
              <>
                <Link to="/" onClick={() => setMobileOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">Home</Link>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">Login</Link>
                <Button size="sm" className="mt-2" onClick={() => { setMobileOpen(false); navigate("/register"); }}>Get Started</Button>
              </>
            ) : (
              <>
                <Link to={role === "admin" ? "/admin" : "/dashboard"} onClick={() => setMobileOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">Dashboard</Link>
                {role === "patient" && (
                  <Link to="/book-appointment" onClick={() => setMobileOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">Book Appointment</Link>
                )}
                <Button size="sm" variant="outline" className="mt-2" onClick={() => { setMobileOpen(false); handleLogout(); }}>Logout</Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
