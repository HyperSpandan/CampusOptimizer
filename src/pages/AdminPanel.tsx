import { motion } from "motion/react";
import { BarChart3, Users, Calendar, Box, TrendingUp, AlertTriangle, Plus, Download, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie } from "recharts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import TiltCard from "@/components/TiltCard";
import { useState, useEffect } from "react";
import { db, auth, handleFirestoreError, OperationType } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function AdminPanel() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResource, setNewResource] = useState({
    name: "",
    type: "Study Room",
    location: "",
    capacity: 1,
    status: "available",
    category: "infrastructure"
  });

  useEffect(() => {
    const unsubBookings = onSnapshot(
      query(collection(db, "bookings"), orderBy("createdAt", "desc")),
      (snapshot) => {
        setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "bookings")
    );

    const unsubResources = onSnapshot(
      collection(db, "resources"),
      (snapshot) => {
        setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "resources")
    );

    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "users")
    );

    return () => {
      unsubBookings();
      unsubResources();
      unsubUsers();
    };
  }, []);

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "resources"), {
        ...newResource,
        createdAt: serverTimestamp(),
      });
      setIsAddingResource(false);
      setNewResource({
        name: "",
        type: "Study Room",
        location: "",
        capacity: 1,
        status: "available",
        category: "infrastructure"
      });
      toast.success("Resource added successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "resources");
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), { status });
      toast.success(`Booking ${status} successfully!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      await deleteDoc(doc(db, "resources", resourceId));
      toast.success("Resource deleted successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `resources/${resourceId}`);
    }
  };

  // Analytics Calculations
  const totalBookings = bookings.length;
  const activeUsers = users.length;
  const maintenanceCount = resources.filter(r => r.status === "maintenance").length;
  const avgUtilization = resources.length > 0 ? Math.round((bookings.length / (resources.length * 10)) * 100) : 0;

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const bookingStats = days.map(day => {
    const count = bookings.filter(b => {
      if (!b.createdAt) return false;
      const date = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return days[date.getDay()] === day;
    }).length;
    return { name: day, bookings: count };
  });

  const resourceTypes = Array.from(new Set(resources.map(r => r.type)));
  const resourceDistribution = resourceTypes.map((type, i) => {
    const count = resources.filter(r => r.type === type).length;
    const colors = ["#00ff99", "#3b82f6", "#a855f7", "#eab308", "#ef4444"];
    return {
      name: type,
      value: Math.round((count / resources.length) * 100),
      color: colors[i % colors.length]
    };
  });

  const handleSeedData = async () => {
    if (resources.length > 0) {
      toast.error("Database already has resources.");
      return;
    }

    const initialResources = [
      {
        name: "Quantum Computing Lab",
        type: "Computer Lab",
        location: "Science Block, 3rd Floor",
        capacity: 20,
        status: "available",
        category: "infrastructure"
      },
      {
        name: "Study Room B204",
        type: "Study Room",
        location: "Library, Wing B",
        capacity: 4,
        status: "available",
        category: "infrastructure"
      },
      {
        name: "Main Seminar Hall",
        type: "Seminar Hall",
        location: "Main Admin Building",
        capacity: 200,
        status: "available",
        category: "infrastructure"
      },
      {
        name: "Collaboration Space Alpha",
        type: "Collaboration Space",
        location: "Student Center",
        capacity: 12,
        status: "available",
        category: "infrastructure"
      },
      {
        name: "High-End Projector",
        type: "Electrical Appliance",
        location: "AV Storage, Room 101",
        capacity: 1,
        status: "available",
        category: "equipment"
      },
      {
        name: "Electric Guitar (Fender)",
        type: "Musical Equipment",
        location: "Music Room, Arts Wing",
        capacity: 1,
        status: "available",
        category: "equipment"
      },
      {
        name: "Professional DSLR Kit",
        type: "Media Equipment",
        location: "Media Lab, 2nd Floor",
        capacity: 1,
        status: "available",
        category: "equipment"
      },
      {
        name: "Basketball Set (Pro)",
        type: "Sports Equipment",
        location: "Sports Complex",
        capacity: 1,
        status: "available",
        category: "equipment"
      }
    ];

    try {
      for (const res of initialResources) {
        await addDoc(collection(db, "resources"), {
          ...res,
          createdAt: serverTimestamp(),
        });
      }
      toast.success("Initial resources seeded successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "resources");
    }
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden mesh-gradient">
      {/* Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 mb-12">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-2"
            >
              <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 font-black px-3 py-1 text-[8px] sm:text-[10px] uppercase tracking-widest">
                Admin Control
              </Badge>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[8px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Live Analytics</span>
              </div>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none uppercase"
            >
              SYSTEM <span className="text-primary neon-text">ANALYTICS</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-4 max-w-md font-medium text-sm sm:text-base"
            >
              Deep insights into campus resource utilization and student engagement.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-6 md:mt-0"
          >
            {resources.length === 0 && (
              <Button 
                onClick={handleSeedData}
                variant="outline" 
                className="rounded-xl sm:rounded-2xl h-14 px-6 font-black text-xs uppercase tracking-widest glass border-primary/20 text-primary hover:bg-primary/10 w-full sm:w-auto"
              >
                <Sparkles className="w-4 h-4 mr-2" /> Seed Data
              </Button>
            )}
            <Button variant="outline" className="rounded-xl sm:rounded-2xl h-14 px-6 font-black text-xs uppercase tracking-widest glass border-white/10 hover:bg-white/5 w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" /> Export Data
            </Button>
            <Button 
              onClick={() => setIsAddingResource(true)}
              className="rounded-xl sm:rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest bg-primary text-primary-foreground neon-glow w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Resource
            </Button>
          </motion.div>
        </div>

        {/* Add Resource Modal */}
        {isAddingResource && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 w-full max-w-lg relative overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setIsAddingResource(false)}
                className="absolute top-6 sm:top-8 right-6 sm:right-8 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase mb-6 sm:mb-8">Add New Resource</h2>
              <form onSubmit={handleAddResource} className="flex flex-col gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Resource Name</label>
                  <Input 
                    required
                    placeholder="e.g. Quantum Computing Lab"
                    className="h-14 rounded-xl sm:rounded-2xl glass border-white/10 focus:border-primary/50 font-bold"
                    value={newResource.name}
                    onChange={e => setNewResource({...newResource, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Type</label>
                    <select 
                      className="w-full h-14 rounded-xl sm:rounded-2xl glass border border-white/10 bg-transparent px-4 font-bold text-sm outline-none focus:border-primary/50 appearance-none"
                      value={newResource.type}
                      onChange={e => setNewResource({...newResource, type: e.target.value})}
                    >
                      <option value="Study Room">Study Room</option>
                      <option value="Computer Lab">Computer Lab</option>
                      <option value="Seminar Hall">Seminar Hall</option>
                      <option value="Electrical Appliance">Electrical Appliance</option>
                      <option value="Musical Equipment">Musical Equipment</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Category</label>
                    <select 
                      className="w-full h-14 rounded-xl sm:rounded-2xl glass border border-white/10 bg-transparent px-4 font-bold text-sm outline-none focus:border-primary/50 appearance-none"
                      value={newResource.category}
                      onChange={e => setNewResource({...newResource, category: e.target.value})}
                    >
                      <option value="infrastructure">Infrastructure</option>
                      <option value="equipment">Equipment</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Location</label>
                  <Input 
                    required
                    placeholder="e.g. Science Block, 3rd Floor"
                    className="h-14 rounded-xl sm:rounded-2xl glass border-white/10 focus:border-primary/50 font-bold"
                    value={newResource.location}
                    onChange={e => setNewResource({...newResource, location: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Capacity</label>
                    <Input 
                      type="number"
                      required
                      className="h-14 rounded-xl sm:rounded-2xl glass border-white/10 focus:border-primary/50 font-bold"
                      value={newResource.capacity}
                      onChange={e => setNewResource({...newResource, capacity: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Status</label>
                    <select 
                      className="w-full h-14 rounded-xl sm:rounded-2xl glass border border-white/10 bg-transparent px-4 font-bold text-sm outline-none focus:border-primary/50 appearance-none"
                      value={newResource.status}
                      onChange={e => setNewResource({...newResource, status: e.target.value})}
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" className="h-14 sm:h-16 rounded-xl sm:rounded-2xl bg-primary text-primary-foreground font-black text-base sm:text-lg mt-4 hover:neon-glow transition-all">
                  CREATE RESOURCE
                </Button>
              </form>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Bookings", value: totalBookings.toLocaleString(), icon: Calendar, trend: "+14%", color: "text-primary" },
            { label: "Active Users", value: activeUsers.toLocaleString(), icon: Users, trend: "+5%", color: "text-blue-500" },
            { label: "Avg. Utilization", value: `${avgUtilization}%`, icon: BarChart3, trend: "+2%", color: "text-purple-500" },
            { label: "Maintenance", value: maintenanceCount.toString(), icon: AlertTriangle, trend: "-1", color: "text-yellow-500" },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <TiltCard className="p-8 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110", stat.color)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="rounded-full bg-white/5 border-white/10 text-[10px] font-black px-3 py-1">
                    {stat.trend}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{stat.label}</p>
                <p className="text-4xl font-black mt-1 tracking-tighter leading-none">{stat.value}</p>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12">
          {/* Booking Volume Chart */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-white/10"
          >
            <div className="flex items-center justify-between mb-8 sm:mb-10">
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase">BOOKING VOLUME</h3>
                <p className="text-muted-foreground text-xs sm:text-sm font-medium">Weekly distribution</p>
              </div>
              <div className="flex items-center gap-2 text-primary text-[10px] sm:text-xs font-black uppercase tracking-widest">
                <TrendingUp className="w-4 h-4" /> Live Feed
              </div>
            </div>
            <div className="h-[250px] sm:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                    contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", backdropFilter: "blur(10px)", color: "var(--foreground)" }}
                  />
                  <Bar dataKey="bookings" fill="#00ff99" radius={[8, 8, 0, 0]}>
                    {bookingStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.bookings > 0 ? "#00ff99" : "rgba(0,255,153,0.3)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Resource Distribution */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-border"
          >
            <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-8 sm:mb-10 uppercase">RESOURCE ALLOCATION</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 sm:gap-12">
              <div className="h-[240px] sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resourceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {resourceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", backdropFilter: "blur(10px)", color: "var(--foreground)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-4 sm:gap-6">
                {resourceDistribution.length > 0 ? resourceDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-transform group-hover:scale-125" style={{ backgroundColor: item.color }} />
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">{item.name}</span>
                    </div>
                    <span className="text-base sm:text-lg font-black">{item.value}%</span>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-[10px] sm:text-sm font-bold uppercase tracking-widest">No resources added yet</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity Table */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 overflow-hidden"
        >
          <div className="p-6 sm:p-10 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase">RECENT ACTIVITY</h3>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium">Real-time booking logs</p>
            </div>
            <Button variant="ghost" className="text-primary font-black uppercase tracking-widest text-[10px] sm:text-xs h-10 sm:h-12 px-4 sm:px-6 rounded-xl hover:bg-primary/10 w-fit">
              View Full Logs
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  <th className="px-6 sm:px-10 py-4 sm:py-6">User Identity</th>
                  <th className="px-6 sm:px-10 py-4 sm:py-6">Resource Node</th>
                  <th className="px-6 sm:px-10 py-4 sm:py-6">Time Slot</th>
                  <th className="px-6 sm:px-10 py-4 sm:py-6">Status</th>
                  <th className="px-6 sm:px-10 py-4 sm:py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.slice(0, 10).map((booking, i) => (
                  <tr key={booking.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 sm:px-10 py-4 sm:py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center font-black text-[10px] sm:text-xs">
                          {booking.userName?.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black tracking-tight text-xs sm:text-sm">{booking.userName}</span>
                          <span className="text-[8px] sm:text-[10px] text-muted-foreground font-bold">{booking.userEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 sm:px-10 py-4 sm:py-6 text-muted-foreground font-medium text-xs sm:text-sm">{booking.resourceName}</td>
                    <td className="px-6 sm:px-10 py-4 sm:py-6 text-muted-foreground font-medium text-xs sm:text-sm">{booking.date} @ {booking.slot}</td>
                    <td className="px-6 sm:px-10 py-4 sm:py-6">
                      <Badge className={cn("rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-3 sm:px-4 py-1 border bg-transparent", 
                        booking.status === "confirmed" ? "text-primary border-primary/20" :
                        booking.status === "waitlist" ? "text-yellow-500 border-yellow-500/20" :
                        "text-destructive border-destructive/20"
                      )}>
                        {booking.status}
                      </Badge>
                    </td>
                    <td className="px-6 sm:px-10 py-4 sm:py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === "confirmed" ? (
                          <Button 
                            onClick={() => handleUpdateBookingStatus(booking.id, "cancelled")}
                            variant="ghost" size="sm" className="text-destructive font-black text-[8px] sm:text-[10px] uppercase tracking-widest hover:bg-destructive/10 h-8 sm:h-9"
                          >
                            Cancel
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleUpdateBookingStatus(booking.id, "confirmed")}
                            variant="ghost" size="sm" className="text-primary font-black text-[8px] sm:text-[10px] uppercase tracking-widest hover:bg-primary/10 h-8 sm:h-9"
                          >
                            Confirm
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 sm:px-10 py-16 sm:py-20 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs sm:text-sm">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Resource Management Section */}
        <div className="mt-16 sm:mt-24 mb-12">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase mb-6 sm:mb-8">Resource <span className="text-primary">Management</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {resources.map((resource) => (
              <TiltCard key={resource.id} className="p-6 sm:p-8 flex flex-col gap-4 sm:gap-6">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 font-black px-3 py-1 text-[8px] sm:text-[10px] uppercase tracking-widest mb-2">
                      {resource.type}
                    </Badge>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase">{resource.name}</h3>
                  </div>
                  <Button 
                    onClick={() => handleDeleteResource(resource.id)}
                    variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-xl h-10 w-10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Box className="w-4 h-4" /> {resource.location}
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" /> Capacity: {resource.capacity}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2 sm:mt-4">
                  <Badge className={cn("rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-3 sm:px-4 py-1", 
                    resource.status === "available" ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                  )}>
                    {resource.status}
                  </Badge>
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">{resource.category}</span>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
