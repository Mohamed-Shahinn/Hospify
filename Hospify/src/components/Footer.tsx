import { Heart, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t bg-primary py-16">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-secondary/10 blur-3xl" />
      
      <div className="container relative z-10">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 font-heading text-xl font-bold text-primary-foreground">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Heart className="h-5 w-5" />
              </div>
              MedCare HMS
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/60">
              Simplifying healthcare management for clinics and hospitals worldwide. Book, manage, and track — all in one place.
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">Quick Links</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Home</Link>
              <Link to="/login" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Login</Link>
              <Link to="/register" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Register</Link>
            </div>
          </div>
          
          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">Contact</h4>
            <div className="flex flex-col gap-2.5">
              <span className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <Mail className="h-4 w-4" /> support@medcare.com
              </span>
              <span className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <Phone className="h-4 w-4" /> +1 (555) 000-0000
              </span>
              <span className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <MapPin className="h-4 w-4" /> New York, NY
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-primary-foreground/10 pt-6 text-center">
          <p className="text-xs text-primary-foreground/40">
            © 2026 MedCare HMS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
