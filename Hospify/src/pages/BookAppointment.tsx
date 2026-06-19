import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Check, ArrowLeft, ArrowRight, Stethoscope, Clock } from "lucide-react";

const doctors = [
  { id: "1", name: "Dr. Sarah Wilson", specialization: "Cardiology", slots: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM"] },
  { id: "2", name: "Dr. James Chen", specialization: "Dermatology", slots: ["10:00 AM", "1:00 PM", "3:00 PM"] },
  { id: "3", name: "Dr. Emily Brown", specialization: "Orthopedics", slots: ["9:00 AM", "11:00 AM", "4:00 PM"] },
  { id: "4", name: "Dr. Michael Lee", specialization: "Pediatrics", slots: ["8:00 AM", "10:00 AM", "2:00 PM", "4:00 PM"] },
];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const doctor = doctors.find((d) => d.id === selectedDoctor);

  const handleConfirm = () => setStep(3);

  if (step === 3) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/20">
        <Navbar />
        <main className="flex flex-1 items-center justify-center py-16">
          <Card className="glass-card w-full max-w-md border-0 text-center shadow-2xl animate-scale-in">
            <CardContent className="p-10">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 ring-4 ring-success/20">
                <Check className="h-10 w-10 text-success" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground">Appointment Booked!</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Your appointment with <span className="font-semibold text-foreground">{doctor?.name}</span> on{" "}
                <span className="font-semibold text-foreground">{selectedDate}</span> at{" "}
                <span className="font-semibold text-foreground">{selectedTime}</span> has been confirmed.
              </p>
              <Button className="mt-8 h-11 w-full shadow-sm" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container max-w-2xl">
          <div className="mb-8 animate-fade-in">
            <button onClick={() => navigate("/dashboard")} className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </button>
            <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">Book an Appointment</h1>
            <p className="text-muted-foreground">Select a doctor, date, and time slot.</p>
          </div>

          {/* Steps */}
          <div className="mb-8 flex items-center gap-3 animate-fade-in" style={{ animationDelay: "0.1s", opacity: 0 }}>
            {["Select Details", "Confirm"].map((label, i) => (
              <div key={label} className="flex flex-1 items-center gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  i + 1 <= step ? "bg-accent text-accent-foreground shadow-sm" : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <span className={`hidden text-sm font-medium sm:block ${i + 1 <= step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                {i === 0 && <div className={`h-0.5 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-accent" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <Card className="glass-card border-0 shadow-xl animate-fade-in" style={{ animationDelay: "0.2s", opacity: 0 }}>
              <CardHeader className="border-b bg-card/50">
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Stethoscope className="h-5 w-5 text-accent" /> Select Doctor & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Doctor</Label>
                  <Select value={selectedDoctor} onValueChange={(v) => { setSelectedDoctor(v); setSelectedTime(""); }}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Choose a doctor" /></SelectTrigger>
                    <SelectContent>
                      {doctors.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          <span className="font-medium">{d.name}</span>
                          <span className="ml-2 text-muted-foreground">— {d.specialization}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date</Label>
                  <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="h-11" />
                </div>
                {doctor && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4 text-accent" /> Available Times
                    </Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {doctor.slots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                            selectedTime === slot
                              ? "border-accent bg-accent/10 text-accent shadow-sm"
                              : "border-transparent bg-muted/50 text-muted-foreground hover:border-accent/30 hover:bg-muted"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <Button
                  className="h-11 w-full shadow-sm"
                  disabled={!selectedDoctor || !selectedDate || !selectedTime}
                  onClick={() => setStep(2)}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="glass-card border-0 shadow-xl animate-fade-in">
              <CardHeader className="border-b bg-card/50">
                <CardTitle className="font-heading">Confirm Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-3 rounded-xl bg-muted/30 p-5">
                  {[
                    { label: "Doctor", value: doctor?.name },
                    { label: "Specialization", value: doctor?.specialization },
                    { label: "Date", value: selectedDate },
                    { label: "Time", value: selectedTime },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-1">
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                      <span className="text-sm font-semibold text-foreground">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="h-11 flex-1" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button className="h-11 flex-1 shadow-sm" onClick={handleConfirm}>
                    <Check className="mr-2 h-4 w-4" /> Confirm Booking
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
