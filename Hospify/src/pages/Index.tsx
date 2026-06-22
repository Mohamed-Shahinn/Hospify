import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Phone, MapPin, Clock, ArrowRight, Stethoscope, Activity, Video, HomeIcon,
  Heart, Brain, Baby, Eye, Bone, Pill, Microscope, Syringe, Scissors, Ear,
  CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import clinicHero from "@/assets/clinic-hero.jpg";
import aboutClinic from "@/assets/about-clinic.jpg";

const branches = [
  { name: "Sheikh Zayed Branch", hours: "Sat–Thu (09:00 am – 10:00 pm)", phone: "+1 (555) 400-0777" },
  { name: "East Cairo Branch", hours: "Sat–Thu (09:00 am – 10:00 pm)", phone: "+1 (555) 266-5777" },
  { name: "North Coast Branch", hours: "Everyday 10:00 am – 12:00 am", phone: "+1 (555) 400-0776" },
];

const quickServices = [
  { icon: Stethoscope, title: "Our Clinics", desc: "First of its kind medical care with 30+ specializations under one roof, working together as one unit.", cta: "More Info" },
  { icon: Activity, title: "Specialized Services", desc: "Highly specialized doctors operate our surgical center, endoscopy, ultrasound and more — for the best clinical care.", cta: "More Info" },
  { icon: Video, title: "Online Medicine", desc: "Online consultations available for most outpatient specialties, provided by the best medical specialists.", cta: "Request Now" },
  { icon: HomeIcon, title: "Home Visits", desc: "We arrange home visits including checkups and investigations with portable medical devices.", cta: "Request Now" },
];

const services = [
  { title: "Cardiac Diagnostic Lab", desc: "ECG, Echocardiography & vascular duplex, Treadmill test, 24h Holter & blood pressure recording." },
  { title: "Check Up Program", desc: "Book your annual check-up. Early detection of possible illnesses is the best treatment." },
  { title: "Endoscopy Unit", desc: "Latest fiber-optic imaging of the GI tract. Performed by experienced consultants and surgical procedures." },
  { title: "Laboratory", desc: "Full lab services as well as home visits from 10 am to 10 pm, with same-day results." },
  { title: "Skin & Laser Unit", desc: "Cosmetic laser therapy, hair removal, treatment for wrinkles, fine lines, acne scars & more." },
  { title: "Surgical Center", desc: "Brand new surgical center for day-case surgeries with leading consultants and modern equipment." },
  { title: "Ultrasound Unit", desc: "Up-to-date equipment for abdominal, pelvic, vascular, cardiac, obstetrics and gynecological scans." },
  { title: "Physiotherapy", desc: "Improve a range of conditions associated with different systems of the body through expert rehab." },
];

const specialties = [
  { icon: Heart, name: "Cardiology" }, { icon: Brain, name: "Neurology" },
  { icon: Baby, name: "Pediatrics" }, { icon: Eye, name: "Ophthalmology" },
  { icon: Bone, name: "Orthopedics" }, { icon: Pill, name: "Internal Medicine" },
  { icon: Microscope, name: "Pathology" }, { icon: Syringe, name: "Vaccination" },
  { icon: Scissors, name: "Surgery" }, { icon: Ear, name: "ENT" },
  { icon: Stethoscope, name: "General Practice" }, { icon: Activity, name: "Pulmonology" },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top utility bar — branch quick contact */}
      <div className="hidden bg-primary text-primary-foreground lg:block">
        <div className="container flex items-center justify-between py-2 text-xs">
          <span className="flex items-center gap-2 text-muted/80">
            <Clock className="h-3.5 w-3.5" /> Open today · 09:00 am – 10:00 pm
          </span>
          <div className="flex items-center gap-6">
            {branches.map((b) => (
              <a key={b.name} href={`tel:${b.phone}`} className="flex items-center gap-1.5 transition-colors hover:text-accent">
                <Phone className="h-3.5 w-3.5 text-accent" />
                <span className="text-muted/70">{b.name.replace(" Branch", "")}:</span>
                <span className="font-medium">{b.phone}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <Navbar />

      {/* Hero — split layout */}
      <section className="relative overflow-hidden bg-gradient-to-br from-muted/40 via-background to-background">
        <div className="container grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-in">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Leading Multi-Specialty Clinic
            </span>
            <h1 className="font-heading text-4xl font-extrabold leading-[1.1] text-primary md:text-5xl lg:text-6xl">
              Premium Healthcare,<br />
              <span className="gradient-text">Centered Around You.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              30+ specializations working together as one unit. Book appointments, manage records, and connect with top doctors — all in one trusted platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" className="h-12 px-7 text-base shadow-lg shadow-accent/20" onClick={() => navigate("/register")}>
                Book Appointment <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 border-2 px-7 text-base" onClick={() => navigate("/login")}>
                Patient Login
              </Button>
            </div>

            <div className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-border/60 pt-6">
              {[{ n: "30+", l: "Specialties" }, { n: "200+", l: "Doctors" }, { n: "50K+", l: "Patients" }].map((s) => (
                <div key={s.l}>
                  <div className="font-heading text-2xl font-extrabold text-primary">{s.n}</div>
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-accent/20 to-secondary/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-border/60">
              <img src={clinicHero} alt="Modern clinic reception" width={1280} height={960} className="aspect-[4/3] w-full object-cover" />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-card p-4 shadow-xl ring-1 ring-border md:flex md:items-center md:gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Trusted Care</div>
                <div className="text-xs text-muted-foreground">HIPAA Compliant · 24/7 Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 quick service cards (Oasis-style) */}
      <section className="relative -mt-6 pb-20">
        <div className="container">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {quickServices.map((s, i) => (
              <div
                key={s.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-accent/40 animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
              >
                <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100" />
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/10 to-secondary/10 text-accent transition-transform group-hover:scale-110">
                  <s.icon className="h-7 w-7" />
                </div>
                <h3 className="font-heading text-lg font-bold text-primary">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                <button
                  onClick={() => navigate("/register")}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent hover:gap-2.5 transition-all"
                >
                  {s.cta} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About — image left / text right */}
      <section className="bg-muted/30 py-24">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="overflow-hidden rounded-3xl shadow-xl">
              <img src={aboutClinic} alt="Doctor consulting with patient" loading="lazy" width={1024} height={768} className="aspect-[4/3] w-full object-cover" />
            </div>
            <div className="absolute -right-4 -top-4 hidden h-24 w-24 rounded-2xl bg-accent/90 p-4 text-accent-foreground shadow-xl md:flex md:flex-col md:items-center md:justify-center">
              <div className="font-heading text-2xl font-extrabold">25+</div>
              <div className="text-[10px] uppercase tracking-wider">Years</div>
            </div>
          </div>
          <div>
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-accent">Who We Are</span>
            <h2 className="font-heading text-3xl font-bold text-primary md:text-4xl">About Hospify</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Hospify is a hospital management platform supporting high-quality healthcare services. From outpatient appointments to inpatient care, it brings a wide range of medical services together in one coordinated system.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Our commitment goes beyond treatment, emphasizing disease prevention through education and routine checkups. Our highly qualified doctors across 30+ specialties work together as one skilled team, delivering personalized diagnosis, treatment, and follow-up.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-3">
              {["30+ Specializations", "Same-day Booking", "Expert Consultants", "Modern Equipment"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-accent" /> {t}
                </li>
              ))}
            </ul>
            <Button className="mt-8" onClick={() => navigate("/register")}>Read More <ArrowRight className="ml-1.5 h-4 w-4" /></Button>
          </div>
        </div>
      </section>

      {/* Specialized Services list */}
      <section className="py-24">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-accent">What We Offer</span>
            <h2 className="font-heading text-3xl font-bold text-primary md:text-4xl">Specialized Services</h2>
            <p className="mt-4 text-muted-foreground">
              A complete suite of diagnostic and treatment services delivered by top medical specialists.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-3xl bg-border sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <div key={s.title} className="group bg-card p-6 transition-colors hover:bg-muted/40">
                <h3 className="font-heading text-base font-bold text-primary group-hover:text-accent transition-colors">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinics / Specialties — circular icons grid */}
      <section className="bg-gradient-to-b from-muted/30 to-background py-24">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-accent">Our Clinics</span>
            <h2 className="font-heading text-3xl font-bold text-primary md:text-4xl">30+ Specialties Under One Roof</h2>
            <p className="mt-4 text-muted-foreground">
              Offering high-quality healthcare across a wide spectrum of specializations.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {specialties.map((sp, i) => (
              <button
                key={sp.name}
                onClick={() => navigate("/register")}
                className="group flex flex-col items-center gap-3 rounded-2xl p-4 transition-all hover:bg-card hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-accent/10 blur-xl transition-opacity opacity-0 group-hover:opacity-100" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-secondary/10 to-accent/10 ring-2 ring-border/60 transition-all group-hover:ring-accent/50 group-hover:scale-105">
                    <sp.icon className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <span className="text-center font-heading text-sm font-semibold text-primary">{sp.name}</span>
              </button>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="outline" size="lg" onClick={() => navigate("/register")}>Show All Specialties</Button>
          </div>
        </div>
      </section>

      {/* Branches contact section */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-accent">Visit Us</span>
            <h2 className="font-heading text-3xl font-bold text-muted md:text-4xl">Our Branches</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {branches.map((b) => (
              <div key={b.name} className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-6 backdrop-blur transition-all hover:border-accent/40 hover:bg-primary-foreground/10">
                <h3 className="font-heading text-lg font-bold text-muted">{b.name}</h3>
                <p className="mt-3 flex items-start gap-2 text-sm text-muted/70">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  Premium Medical District, Suite 200
                </p>
                <p className="mt-2 flex items-start gap-2 text-sm text-muted/70">
                  <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  {b.hours}
                </p>
                <a href={`tel:${b.phone}`} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-transform hover:scale-105">
                  <Phone className="h-4 w-4" /> {b.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-accent/10 via-secondary/5 to-background p-10 text-center ring-1 ring-border md:p-16">
            <h2 className="font-heading text-3xl font-bold text-primary md:text-4xl">
              Book Your Visit Today
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Join thousands of patients who trust Hospify for accessible, expert healthcare.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => navigate("/register")}>Book Appointment</Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/login")}>Sign In</Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
