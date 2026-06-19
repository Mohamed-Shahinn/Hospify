import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Calendar, BarChart3, Stethoscope, CheckCircle, XCircle, Clock, TrendingUp, DollarSign, Activity } from "lucide-react";

const allAppointments = [
  { id: 1, patient: "John Doe", doctor: "Dr. Sarah Wilson", date: "2026-04-20", time: "10:00 AM", status: "booked" as const },
  { id: 2, patient: "Jane Smith", doctor: "Dr. James Chen", date: "2026-04-18", time: "2:30 PM", status: "completed" as const },
  { id: 3, patient: "Bob Johnson", doctor: "Dr. Emily Brown", date: "2026-04-19", time: "9:00 AM", status: "booked" as const },
  { id: 4, patient: "Alice Brown", doctor: "Dr. Sarah Wilson", date: "2026-04-17", time: "11:00 AM", status: "cancelled" as const },
  { id: 5, patient: "Charlie Lee", doctor: "Dr. Michael Lee", date: "2026-04-21", time: "4:00 PM", status: "booked" as const },
  { id: 6, patient: "Diana Prince", doctor: "Dr. James Chen", date: "2026-04-16", time: "1:00 PM", status: "completed" as const },
];

const doctorsList = [
  { name: "Dr. Sarah Wilson", specialization: "Cardiology", patients: 124, available: true },
  { name: "Dr. James Chen", specialization: "Dermatology", patients: 98, available: true },
  { name: "Dr. Emily Brown", specialization: "Orthopedics", patients: 87, available: false },
  { name: "Dr. Michael Lee", specialization: "Pediatrics", patients: 156, available: true },
];

const statusStyles = {
  booked: "bg-accent/10 text-accent border-accent/30",
  completed: "bg-success/10 text-success border-success/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

const statusIcons = { booked: Clock, completed: CheckCircle, cancelled: XCircle };

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState(allAppointments);
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = appointments.filter((a) => {
    if (filterDoctor !== "all" && a.doctor !== filterDoctor) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });

  const updateStatus = (id: number, status: "booked" | "completed" | "cancelled") => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const stats = [
    { label: "Total Patients", value: "465", icon: Users, change: "+12%", gradient: "from-accent/20 to-accent/5" },
    { label: "Appointments", value: String(appointments.length), icon: Calendar, change: "+8%", gradient: "from-secondary/20 to-secondary/5" },
    { label: "Active Doctors", value: String(doctorsList.filter((d) => d.available).length), icon: Stethoscope, change: "—", gradient: "from-success/20 to-success/5" },
    { label: "Revenue", value: "$12,450", icon: DollarSign, change: "+23%", gradient: "from-warning/20 to-warning/5" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-heading text-lg font-bold">
                A
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">Admin Dashboard</h1>
                <p className="text-muted-foreground">Monitor and manage your clinic operations.</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Card key={s.label} className="glass-card hover-lift overflow-hidden border-0 animate-fade-in" style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                <CardContent className="relative p-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-50`} />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                      <p className="mt-1 text-3xl font-bold text-foreground">{s.value}</p>
                      {s.change !== "—" && (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-success">
                          <TrendingUp className="h-3 w-3" /> {s.change}
                        </span>
                      )}
                    </div>
                    <div className="rounded-xl bg-card/80 p-3 shadow-sm">
                      <s.icon className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Appointments */}
            <div className="lg:col-span-2">
              <Card className="glass-card border-0 overflow-hidden animate-fade-in" style={{ animationDelay: "0.4s", opacity: 0 }}>
                <CardHeader className="border-b bg-card/50">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="font-heading flex items-center gap-2">
                      <Activity className="h-5 w-5 text-accent" /> All Appointments
                    </CardTitle>
                    <div className="flex gap-2">
                      <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                        <SelectTrigger className="h-9 w-[160px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Doctors</SelectItem>
                          {doctorsList.map((d) => (
                            <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="h-9 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="booked">Booked</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filtered.map((a) => {
                      const Icon = statusIcons[a.status];
                      return (
                        <div key={a.id} className="flex flex-col gap-3 p-5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-xs font-bold text-accent">
                              {a.patient.split(" ").map((w) => w[0]).join("")}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{a.patient}</p>
                              <p className="text-sm text-muted-foreground">{a.doctor} • {a.date} • {a.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`${statusStyles[a.status]} rounded-lg px-3 py-1 font-medium capitalize`}>
                              <Icon className="mr-1 h-3 w-3" />
                              {a.status}
                            </Badge>
                            {a.status === "booked" && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="h-8 text-xs text-success hover:text-success hover:bg-success/5" onClick={() => updateStatus(a.id, "completed")}>
                                  Complete
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/5" onClick={() => updateStatus(a.id, "cancelled")}>
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {filtered.length === 0 && (
                      <p className="py-12 text-center text-muted-foreground">No appointments match your filters.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Doctors */}
            <Card className="glass-card border-0 overflow-hidden animate-fade-in" style={{ animationDelay: "0.5s", opacity: 0 }}>
              <CardHeader className="border-b bg-card/50">
                <CardTitle className="font-heading flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-accent" /> Doctors
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {doctorsList.map((d) => (
                    <div key={d.name} className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/30">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
                        {d.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.specialization} • {d.patients} patients</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${d.available ? "text-success" : "text-muted-foreground"}`}>
                          {d.available ? "Online" : "Offline"}
                        </span>
                        <div className={`h-2.5 w-2.5 rounded-full ${d.available ? "bg-success animate-pulse" : "bg-muted-foreground/30"}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
