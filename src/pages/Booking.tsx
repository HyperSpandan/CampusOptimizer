import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Calendar as CalendarIcon, Clock, CheckCircle2, ArrowRight, AlertCircle, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { db, auth, handleFirestoreError, OperationType } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc } from "firebase/firestore";

const TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", 
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", 
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
];

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resourceId = searchParams.get("resourceId");

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [resource, setResource] = useState<any>(null);
  const [busySlots, setBusySlots] = useState<string[]>([]);

  useEffect(() => {
    if (resourceId) {
      // Fetch resource details
      const fetchResource = async () => {
        try {
          const docRef = doc(db, "resources", resourceId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setResource({ id: docSnap.id, ...docSnap.data() });
          } else {
            // Fallback to mock if not in DB yet
            setResource({
              id: resourceId,
              name: "Quantum Computing Lab",
              location: "Science Block, 3rd Floor",
            });
          }
        } catch (error) {
          console.error("Error fetching resource:", error);
        }
      };
      fetchResource();

      // Fetch busy slots for the selected date
      const fetchBusySlots = async () => {
        if (!date) return;
        try {
          const dateStr = date.toISOString().split('T')[0];
          const q = query(
            collection(db, "bookings"),
            where("resourceId", "==", resourceId),
            where("date", "==", dateStr),
            where("status", "==", "confirmed")
          );
          const querySnapshot = await getDocs(q);
          const slots = querySnapshot.docs.map(doc => doc.data().slot);
          setBusySlots(slots);
        } catch (error) {
          console.error("Error fetching busy slots:", error);
        }
      };
      fetchBusySlots();
    }
  }, [resourceId, date]);

  const handleBooking = async () => {
    if (!auth.currentUser) {
      toast.error("Please sign in to book a resource.");
      return;
    }

    if (!date || !selectedSlot) {
      toast.error("Please select a date and time slot.");
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingData = {
        resourceId,
        resourceName: resource?.name || "Unknown Resource",
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || auth.currentUser.email,
        userEmail: auth.currentUser.email,
        date: date.toISOString().split('T')[0],
        slot: selectedSlot,
        status: "confirmed",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "bookings"), bookingData);
      
      setIsSubmitting(false);
      setIsConfirmed(true);
      toast.success("Booking confirmed successfully!");
    } catch (error) {
      setIsSubmitting(false);
      handleFirestoreError(error, OperationType.CREATE, "bookings");
    }
  };

  if (isConfirmed) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 mesh-gradient flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass p-12 rounded-[3rem] border border-primary/20 bg-primary/5 text-center flex flex-col items-center gap-8 max-w-2xl w-full relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          
          <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center neon-glow mb-2 rotate-12">
            <CheckCircle2 className="w-12 h-12 text-primary-foreground -rotate-12" />
          </div>
          
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none mb-4">RESERVATION <br /><span className="text-primary neon-text">SECURED</span></h1>
            <p className="text-muted-foreground text-lg font-medium">
              Your spot at <span className="text-foreground font-bold">{resource.name}</span> is confirmed.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] shadow-2xl relative group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <QRCodeSVG value={`booking-${resource.id}-${Date.now()}`} size={180} className="relative z-10" />
          </div>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Scan at entrance for node access</p>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="glass-dark p-6 rounded-2xl border border-border">
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Date Node</p>
              <p className="text-xl font-black">{date?.toLocaleDateString()}</p>
            </div>
            <div className="glass-dark p-6 rounded-2xl border border-border">
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Time Slot</p>
              <p className="text-xl font-black">{selectedSlot}</p>
            </div>
          </div>

          <Button onClick={() => navigate("/dashboard")} className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg hover:neon-glow transition-all">
            RETURN TO HUB
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden mesh-gradient">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-2"
          >
            <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 font-black px-3 py-1 text-[10px] uppercase tracking-widest">
              Reservation Engine
            </Badge>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">AI Conflict Check Active</span>
            </div>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none uppercase">BOOK YOUR <span className="text-primary neon-text">SPACE</span></h1>
          <p className="text-muted-foreground mt-4 font-medium max-w-md">Secure your spot in the campus ecosystem with real-time slot allocation.</p>
        </div>

        {!resourceId && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-[2rem] border border-yellow-500/20 bg-yellow-500/5 flex flex-col md:flex-row items-center justify-between gap-6 mb-12"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">NO RESOURCE SELECTED</h3>
                <p className="text-muted-foreground font-medium">Please select a specific lab or room from the hub to proceed.</p>
              </div>
            </div>
            <Button onClick={() => navigate("/dashboard")} className="bg-yellow-500 text-black font-black rounded-xl px-8 h-12 hover:opacity-80 transition-all">
              BROWSE HUB
            </Button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Date Selection */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-3 uppercase">
              <CalendarIcon className="w-6 h-6 text-primary" /> 1. Select Date
            </h3>
            <div className="glass p-6 rounded-[2.5rem] border border-white/10">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border-none mx-auto"
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
              />
            </div>
          </div>

          {/* Time Selection */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-3 uppercase">
              <Clock className="w-6 h-6 text-primary" /> 2. Select Time Slot
            </h3>
            <div className="glass p-10 rounded-[2.5rem] border border-white/10">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  const isBusy = busySlots.includes(slot);
                  return (
                    <motion.button
                      key={slot}
                      whileHover={!isBusy ? { scale: 1.05 } : {}}
                      whileTap={!isBusy ? { scale: 0.95 } : {}}
                      disabled={isBusy}
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        "h-16 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center",
                        isSelected ? "bg-primary text-primary-foreground border-primary neon-glow" : 
                        isBusy ? "bg-white/5 text-muted-foreground border-white/5 cursor-not-allowed opacity-30" :
                        "glass border-white/10 text-foreground hover:border-primary/50 hover:bg-primary/5"
                      )}
                    >
                      {slot}
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-16 p-10 glass-dark rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[40px] -mr-24 -mt-24 group-hover:bg-primary/10 transition-colors" />
                
                <div className="relative z-10">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-2">Selected Resource Node</p>
                  <h4 className="text-3xl font-black tracking-tighter uppercase leading-none">{resource.name}</h4>
                  <p className="text-muted-foreground font-medium mt-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary/60" /> {resource.location}
                  </p>
                </div>
                
                <div className="flex flex-col gap-3 min-w-[240px] relative z-10">
                  <Button 
                    onClick={handleBooking}
                    disabled={isSubmitting || !selectedSlot || !date}
                    className="h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg hover:neon-glow transition-all shadow-xl"
                  >
                    {isSubmitting ? "PROCESSING..." : "CONFIRM BOOKING"}
                  </Button>
                  <p className="text-center text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em]">
                    {selectedSlot ? `${date?.toLocaleDateString()} @ ${selectedSlot}` : "Awaiting slot selection"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
