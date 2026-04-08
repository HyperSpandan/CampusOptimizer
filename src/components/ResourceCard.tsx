import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { MapPin, Users, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ResourceProps {
  resource: {
    id: string;
    name: string;
    type: string;
    location: string;
    capacity: number;
    status: string;
    nextAvailable: string;
  };
}

export default function ResourceCard({ resource }: ResourceProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const statusColors = {
    available: "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(0,255,153,0.1)]",
    busy: "bg-destructive/10 text-destructive border-destructive/20",
    soon: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  };

  const statusLabels = {
    available: "Available",
    busy: "Occupied",
    soon: "Soon Available",
  };

  return (
    <motion.div 
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      className="glass rounded-[2.5rem] border border-border overflow-hidden group transition-all flex flex-col h-full relative w-full max-w-[400px]"
    >
      {/* Animated background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
      
      <div 
        style={{ transform: "translateZ(50px)" }}
        className="p-8 flex flex-col gap-6 flex-1"
      >
        <div className="flex items-start justify-between gap-4">
          <Badge variant="outline" className="rounded-full bg-white/5 border-border text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5">
            {resource.type}
          </Badge>
          <div className="flex items-center gap-2">
            {resource.status === "available" && (
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            )}
            <Badge className={cn("rounded-full font-black text-[10px] uppercase tracking-widest px-4 py-1.5 border bg-transparent", statusColors[resource.status as keyof typeof statusColors])}>
              {statusLabels[resource.status as keyof typeof statusLabels]}
            </Badge>
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-black tracking-tighter group-hover:text-primary transition-colors leading-[0.9] uppercase">{resource.name}</h3>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mt-4 font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-primary" /> {resource.location}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-auto">
          <div className="glass-dark p-5 rounded-3xl border border-border flex flex-col gap-1 group-hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary/70" />
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Capacity</p>
            </div>
            <p className="text-xl font-black tracking-tight">{resource.capacity}</p>
          </div>
          <div className="glass-dark p-5 rounded-3xl border border-border flex flex-col gap-1 group-hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary/70" />
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Next Free</p>
            </div>
            <p className="text-xl font-black tracking-tight">{resource.nextAvailable}</p>
          </div>
        </div>
      </div>

      <div 
        style={{ transform: "translateZ(20px)" }}
        className="p-6 bg-black/5 dark:bg-white/5 border-t border-border flex items-center gap-4"
      >
        <Link to={`/resource/${resource.id}`} className="flex-1">
          <Button variant="ghost" className="w-full rounded-2xl hover:bg-white/10 font-black text-[10px] uppercase tracking-widest h-14 border border-transparent hover:border-border">
            Details
          </Button>
        </Link>
        <Link to={`/booking?resourceId=${resource.id}`} className="flex-1">
          <Button className="w-full rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest h-14 hover:neon-glow transition-all shadow-xl shadow-primary/10">
            Book Now
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
