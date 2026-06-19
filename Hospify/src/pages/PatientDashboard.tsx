import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Clock, User, Plus, X, Activity, TrendingUp } from "lucide-react";

const mockAppointments = [
  { id: 1, doctor: "Dr. Sarah Wilson", specialization: "Cardiology", date: "2026-04-20", time: "10:00 AM", status: "booked" as const },
  { id: 2, doctor: "Dr. James Chen", specialization: "Dermatology", date: "2026-04-18", time: "2:30 PM", status: "completed" as const },
  { id: 3, doctor: "Dr. Emily Brown", specialization: "Orthopedics", date: "2026-04-15", time: "9:00 AM", status: "cancelled" as const },
];

const statusStyles = {
  booked: "bg-accent/10 text-accent border-accent/30",
  completed: "bg-success/10 text-success border-success/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function PatientDashboard() {
  const { userName } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState(mockAppointments);

  const cancelAppointment = (id: number) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" as const } : a))
    );
  };

  const stats = [
    { label: "Total Appointments", value: appointments.length, icon: Calendar, gradient: "from-accent/20 to-accent/5" },
    { label: "Upcoming", value: appointments.filter((a) => a.status === "booked").length, icon: Clock, gradient: "from-secondary/20 to-secondary/5" },
    { label: "Completed", value: appointments.filter((a) => a.status === "completed").length, icon: Activity, gradient: "from-success/20 to-success/5" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center animate-fade-in">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 font-heading text-lg font-bold text-accent">
                  {userName?.split(" ").map((w) => w[0]).join("") || "JD"}
                </div>
                <div>
                  <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                    Welcome back, {userName}
                  </h1>
                  <p className="text-muted-foreground">Here's your health overview.</p>
                </div>
              </div>
            </div>
            <Button onClick={() => navigate("/book-appointment")} className="shadow-sm group">
              <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" /> Book Appointment
            </Button>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {stats.map((s, i) => (
              <Card key={s.label} className="glass-card hover-lift overflow-hidden border-0 animate-fade-in" style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                <CardContent className="relative flex items-center gap-4 p-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-50`} />
                  <div className="relative rounded-xl bg-card/80 p-3 shadow-sm">
                    <s.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="relative">
                    <p className="text-3xl font-bold text-foreground">{s.value}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 animate-fade-in" style={{ animationDelay: "0.3s", opacity: 0 }}>
            <button
              onClick={() => navigate("/book-appointment")}
              className="glass-card hover-lift group flex items-center gap-4 rounded-2xl border-0 p-6 text-left transition-all"
            >
              <div className="rounded-xl bg-accent/10 p-4 transition-colors group-hover:bg-accent/20">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground">Schedule New Visit</h3>
                <p className="text-sm text-muted-foreground">Find a doctor and book your appointment</p>
              </div>
              <TrendingUp className="ml-auto h-5 w-5 text-muted-foreground/40 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              className="glass-card hover-lift group flex items-center gap-4 rounded-2xl border-0 p-6 text-left transition-all"
            >
              <div className="rounded-xl bg-secondary/10 p-4 transition-colors group-hover:bg-secondary/20">
                <User className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground">My Profile</h3>
                <p className="text-sm text-muted-foreground">View and update personal information</p>
              </div>
              <TrendingUp className="ml-auto h-5 w-5 text-muted-foreground/40 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Appointments */}
          <Card className="glass-card border-0 overflow-hidden animate-fade-in" style={{ animationDelay: "0.4s", opacity: 0 }}>
            <CardHeader className="border-b bg-card/50">
              <CardTitle className="font-heading">Your Appointments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {appointments.map((a) => (
                  <div key={a.id} className="flex flex-col gap-3 p-5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
                        {a.doctor.split(" ").slice(1).map((w) => w[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{a.doctor}</p>
                        <p className="text-sm text-muted-foreground">{a.specialization}</p>
                        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" /> {a.date}
                          <Clock className="ml-1 h-3.5 w-3.5" /> {a.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`${statusStyles[a.status]} rounded-lg px-3 py-1 font-medium capitalize`}>
                        {a.status}
                      </Badge>
                      {a.status === "booked" && (
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/5" onClick={() => cancelAppointment(a.id)}>
                          <X className="mr-1 h-3 w-3" /> Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
