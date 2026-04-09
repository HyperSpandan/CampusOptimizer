import { motion } from "motion/react";
import { Search, Filter, Plus, TrendingUp, Users, CheckCircle2, Clock, Box, Zap, Sparkles, MapPin, Laptop, Music, Trophy, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import ResourceCard from "@/components/ResourceCard";
import TiltCard from "@/components/TiltCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("infrastructure");
  const [resources, setResources] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const unsubResources = onSnapshot(
      collection(db, "resources"),
      (snapshot) => {
        setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "resources")
    );

    const unsubBookings = onSnapshot(
      collection(db, "bookings"),
      (snapshot) => {
        setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "bookings")
    );

    return () => {
      unsubResources();
      unsubBookings();
    };
  }, []);

  const filterResources = (resources: any[], category: string) => {
    return resources.filter(r => 
      r.category === category &&
      (r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
       r.type.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const filteredInfra = filterResources(resources, "infrastructure");
  const filteredEquip = filterResources(resources, "equipment");

  const stats = [
    { label: "Total Resources", value: resources.length.toString(), icon: Box, color: "text-blue-500" },
    { label: "Available Now", value: resources.filter(r => r.status === "available").length.toString(), icon: CheckCircle2, color: "text-primary" },
    { label: "Total Bookings", value: bookings.length.toString(), icon: TrendingUp, color: "text-purple-500" },
    { label: "Underutilized", value: resources.filter(r => r.status === "maintenance").length.toString(), icon: Clock, color: "text-yellow-500" },
  ];

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden mesh-gradient">
      {/* Animated background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col gap-6 sm:gap-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-4"
              >
                <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 font-black px-3 sm:px-4 py-1.5 text-[8px] sm:text-[10px] uppercase tracking-[0.2em]">
                  Live Inventory
                </Badge>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-border">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[8px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-widest">System Online</span>
                </div>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.85] uppercase mb-4 sm:mb-6"
              >
                CAMPUS <br />
                <span className="text-primary neon-text">INVENTORY</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-base sm:text-lg font-medium max-w-lg"
              >
                Real-time availability and smart booking for all campus infrastructure and equipment.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full md:w-[400px]"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[1.5rem] sm:rounded-[2rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200" />
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="Search rooms or items..." 
                    className="pl-14 w-full h-14 sm:h-16 rounded-[1.2rem] sm:rounded-[1.5rem] glass border-border focus:border-primary/50 transition-all font-bold text-base sm:text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <TiltCard className="p-4 sm:p-6 flex items-center gap-4 sm:gap-5">
                  <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 bg-white/5", stat.color)}>
                    <stat.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-2xl sm:text-3xl font-black tracking-tighter">{stat.value}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="infrastructure" className="w-full flex flex-col items-center" onValueChange={setActiveTab}>
          <div className="w-full flex flex-col items-center gap-6 sm:gap-8 mb-12 sm:mb-16">
            <TabsList className="h-14 sm:h-16 p-1 sm:p-1.5 glass rounded-xl sm:rounded-2xl border border-border flex items-center justify-center w-full max-w-md">
              <TabsTrigger 
                value="infrastructure" 
                className="flex-1 rounded-lg sm:rounded-xl px-4 sm:px-10 font-black text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:neon-glow transition-all h-full flex items-center justify-center"
              >
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2" />
                Infrastructure
              </TabsTrigger>
              <TabsTrigger 
                value="equipment" 
                className="flex-1 rounded-lg sm:rounded-xl px-4 sm:px-10 font-black text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:neon-glow transition-all h-full flex items-center justify-center"
              >
                <Laptop className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2" />
                Equipment
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-full glass border border-border flex items-center gap-2 sm:gap-3">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
                  {activeTab === "infrastructure" ? filteredInfra.length : filteredEquip.length} Available Now
                </span>
              </div>
            </div>
          </div>

          <TabsContent value="infrastructure" className="w-full mt-0 outline-none">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full"
            >
              {filteredInfra.map((resource) => (
                <motion.div
                  key={resource.id}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1 }
                  }}
                  className="flex justify-center"
                >
                  <ResourceCard resource={resource} />
                </motion.div>
              ))}
            </motion.div>
            {filteredInfra.length === 0 && <EmptyState />}
          </TabsContent>

          <TabsContent value="equipment" className="w-full mt-0 outline-none">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full"
            >
              {filteredEquip.map((resource) => (
                <motion.div
                  key={resource.id}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1 }
                  }}
                  className="flex justify-center"
                >
                  <ResourceCard resource={resource} />
                </motion.div>
              ))}
            </motion.div>
            {filteredEquip.length === 0 && <EmptyState />}
          </TabsContent>
        </Tabs>

        {/* AI Suggestion Banner - Re-styled for better flow */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 sm:mt-24 relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-[2rem] sm:rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
          <div className="relative glass-dark p-6 sm:p-10 md:p-12 rounded-[2rem] sm:rounded-[3rem] border border-primary/20 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48" />
            
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative z-10 text-center md:text-left">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-primary/10 rounded-2xl sm:rounded-[2rem] flex items-center justify-center neon-glow animate-float shrink-0">
                <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
              </div>
              <div>
                <Badge className="bg-primary/20 text-primary border-primary/30 mb-3 sm:mb-4 rounded-full px-3 sm:px-4 py-1 font-black text-[8px] sm:text-[10px] uppercase tracking-[0.2em]">
                  AI Optimization
                </Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter mb-3 sm:mb-4 uppercase leading-none">SMART BUNDLE <br className="hidden md:block" /> SUGGESTION</h2>
                <p className="text-muted-foreground text-sm sm:text-lg font-medium max-w-2xl leading-relaxed">
                  Looking for a place to practice? The <span className="text-primary font-bold">Music Room</span> is currently available and the <span className="text-primary font-bold">Electric Guitar</span> is free for the next 3 hours.
                </p>
              </div>
            </div>
            <Button className="bg-primary text-primary-foreground rounded-xl sm:rounded-2xl px-8 sm:px-12 h-14 sm:h-16 text-xs sm:text-sm font-black hover:neon-glow transition-all relative z-10 w-full lg:w-auto uppercase tracking-[0.2em] shadow-2xl shadow-primary/20">
              BOOK BUNDLE
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24 glass rounded-[3rem] border border-dashed border-white/10">
      <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Search className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">No resources found</h3>
      <p className="text-muted-foreground font-medium">Try adjusting your search or switching categories.</p>
    </div>
  );
}
