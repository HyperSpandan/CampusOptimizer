import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { MapPin, Users, Clock, Calendar, ArrowLeft, Info, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType } from "@/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const MOCK_USAGE_DATA = [
  { day: "Mon", usage: 45 },
  { day: "Tue", usage: 52 },
  { day: "Wed", usage: 38 },
  { day: "Thu", usage: 65 },
  { day: "Fri", usage: 48 },
  { day: "Sat", usage: 20 },
  { day: "Sun", usage: 15 },
];

export default function ResourceDetail() {
  const { id } = useParams();
  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchResource = async () => {
        try {
          const docRef = doc(db, "resources", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setResource({ id: docSnap.id, ...docSnap.data() });
          }
          setLoading(false);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `resources/${id}`);
          setLoading(false);
        }
      };
      fetchResource();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center gap-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Node Not Found</h1>
        <Link to="/dashboard">
          <Button className="bg-primary text-primary-foreground font-black rounded-xl px-8 h-12">RETURN TO HUB</Button>
        </Link>
      </div>
    );
  }

  // Use real data or fallbacks
  const displayData = {
    ...resource,
    description: resource.description || "No description provided for this resource node.",
    amenities: resource.amenities || ["High-speed Internet", "Projector", "Whiteboard", "Air Conditioning", "Cloud Access"],
    schedule: resource.schedule || [
      { time: "09:00 AM - 11:00 AM", event: "Advanced Algorithms Class", status: "past" },
      { time: "11:00 AM - 01:00 PM", event: "Research Group Meeting", status: "current" },
      { time: "02:00 PM - 04:00 PM", event: "Available", status: "future" },
      { time: "04:00 PM - 06:00 PM", event: "Data Science Workshop", status: "future" },
    ]
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden mesh-gradient">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link to="/dashboard" className="inline-flex items-center gap-3 text-muted-foreground hover:text-primary transition-all font-black text-xs uppercase tracking-[0.2em] group">
            <div className="w-8 h-8 rounded-lg glass border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Hub
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 flex flex-col gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-10 rounded-[3rem] border border-border relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] -mr-32 -mt-32" />
              
              <div className="flex flex-wrap items-start justify-between gap-6 mb-10 relative z-10">
                <div>
                  <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 font-black px-4 py-1.5 text-[10px] uppercase tracking-widest mb-4">
                    {displayData.type}
                  </Badge>
                  <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none uppercase mb-4">{displayData.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground font-medium text-lg">
                    <MapPin className="w-5 h-5 text-primary/60" /> {displayData.location}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={cn("rounded-full font-black px-6 py-2 text-xs uppercase tracking-widest border bg-transparent", 
                    displayData.status === "available" ? "text-primary border-primary/20" : "text-destructive border-destructive/20"
                  )}>
                    {displayData.status === "available" ? "Status: Online" : "Status: Occupied"}
                  </Badge>
                  {displayData.status === "available" && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                      <span className="text-[10px] text-primary font-black uppercase tracking-widest">Ready for node access</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed text-lg font-medium mb-12 max-w-3xl relative z-10">
                {displayData.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 relative z-10">
                {[
                  { label: "Capacity", value: displayData.capacity, icon: Users },
                  { label: "Next Free", value: displayData.nextAvailable || "Now", icon: Clock },
                  { label: "Network", value: "Gigabit", icon: Sparkles },
                  { label: "Access", value: "Level 2", icon: CheckCircle2 },
                ].map((item) => (
                  <div key={item.label} className="glass-dark p-6 rounded-2xl border border-white/5 flex flex-col gap-2 group hover:border-primary/30 transition-all">
                    <item.icon className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                    <div>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{item.label}</p>
                      <p className="text-xl font-black tracking-tight">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <Tabs defaultValue="usage" className="w-full">
              <TabsList className="glass-dark p-1.5 rounded-2xl border border-white/10 w-full justify-start h-auto gap-2">
                <TabsTrigger value="usage" className="rounded-xl px-8 py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:neon-glow transition-all">
                  Usage Trends
                </TabsTrigger>
                <TabsTrigger value="amenities" className="rounded-xl px-8 py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:neon-glow transition-all">
                  Node Amenities
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="usage" className="glass p-10 rounded-[2.5rem] border border-white/10 mt-6">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight uppercase">Utilization Metrics</h3>
                    <p className="text-muted-foreground text-sm font-medium">Historical occupancy data</p>
                  </div>
                  <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">
                    <TrendingUp className="w-4 h-4" /> +12% Efficiency
                  </div>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_USAGE_DATA}>
                      <defs>
                        <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00ff99" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#00ff99" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "rgba(10,10,12,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", backdropFilter: "blur(10px)" }}
                        itemStyle={{ color: "#00ff99", fontWeight: "bold" }}
                      />
                      <Area type="monotone" dataKey="usage" stroke="#00ff99" strokeWidth={4} fillOpacity={1} fill="url(#colorUsage)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="amenities" className="glass p-10 rounded-[2.5rem] border border-white/10 mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {displayData.amenities.map((amenity: string) => (
                    <div key={amenity} className="flex items-center gap-4 p-6 glass-dark rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
                      <div className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" />
                      <span className="font-black text-xs uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{amenity}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar / Booking */}
          <div className="flex flex-col gap-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-8 rounded-[2.5rem] border border-white/10 sticky top-32"
            >
              <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-tight">
                <Calendar className="w-6 h-6 text-primary" /> Today's Schedule
              </h3>
              <div className="flex flex-col gap-5">
                {displayData.schedule.map((item: any, i: number) => (
                  <div key={i} className={cn("p-6 rounded-2xl border flex flex-col gap-2 transition-all", 
                    item.status === "current" ? "border-primary/40 bg-primary/5 neon-glow" : "border-white/5 bg-white/5"
                  )}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{item.time}</span>
                      {item.status === "current" && (
                        <Badge className="bg-primary text-primary-foreground text-[9px] font-black px-2 h-5 rounded-md">ACTIVE</Badge>
                      )}
                    </div>
                    <span className={cn("text-lg font-black tracking-tight", item.status === "past" ? "text-muted-foreground/50 line-through" : "text-foreground")}>
                      {item.event}
                    </span>
                  </div>
                ))}
              </div>
              
              <Link to={`/booking?resourceId=${displayData.id}`} className="mt-10 block">
                <Button className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg hover:neon-glow transition-all shadow-xl uppercase tracking-tighter">
                  RESERVE NODE
                </Button>
              </Link>
              <div className="flex items-center justify-center gap-2 mt-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                  Instant Node Allocation
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
