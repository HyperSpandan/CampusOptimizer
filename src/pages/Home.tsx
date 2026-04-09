import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Shield, BarChart3, Users, Box, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TiltCard from "@/components/TiltCard";
import Magnetic from "@/components/Magnetic";
import DotGrid from "@/components/DotGrid";
import { auth, signInWithGoogle, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "sonner";

export default function Home() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    if (user) {
      navigate("/dashboard");
    } else {
      try {
        const result = await signInWithGoogle();
        if (result) {
          navigate("/dashboard");
        }
      } catch (error: any) {
        if (error.message && !error.message.includes('cancelled') && !error.message.includes('closed')) {
          toast.error(error.message || "Failed to sign in");
        }
      }
    }
  };
  return (
    <div className="flex flex-col gap-12 sm:gap-24 pb-24 relative overflow-hidden mesh-gradient">
      <DotGrid className="opacity-80" />
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-24 sm:pb-40 px-4 sm:px-6">
        <div className="text-center flex flex-col items-center gap-6 sm:gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[8px] sm:text-[10px] font-black tracking-[0.2em] uppercase"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI-POWERED OPTIMIZATION ENGINE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase"
          >
            SMART <span className="text-primary neon-text">CAMPUS</span> <br />
            INFRASTRUCTURE
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl font-medium leading-relaxed px-4"
          >
            The next generation of campus resource management. Find, book, and optimize 
            shared spaces with real-time AI analytics and zero friction.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mt-4 sm:mt-6 w-full sm:w-auto px-6 sm:px-0"
          >
            <Magnetic className="w-full sm:w-auto">
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="h-14 sm:h-16 w-full sm:px-10 text-base sm:text-lg font-black rounded-2xl bg-primary text-primary-foreground neon-glow hover:scale-105 transition-all"
              >
                {user ? "GO TO DASHBOARD" : "GET STARTED"} <ArrowRight className="ml-2 w-5 sm:w-6 h-5 sm:h-6" />
              </Button>
            </Magnetic>
            {!user && (
              <Magnetic className="w-full sm:w-auto">
                <Button 
                  onClick={handleGetStarted}
                  size="lg" 
                  variant="outline" 
                  className="h-14 sm:h-16 w-full sm:px-10 text-base sm:text-lg font-black rounded-2xl border-white/10 glass hover:bg-white/5 hover:scale-105 transition-all"
                >
                  RESERVE SPACE
                </Button>
              </Magnetic>
            )}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Total Resources", value: "124", icon: Box },
            { label: "Active Users", value: "1.2k", icon: Users },
            { label: "Bookings Today", value: "482", icon: Calendar },
            { label: "Efficiency Rate", value: "94%", icon: BarChart3 },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <TiltCard className="p-8 h-full flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.15em]">{stat.label}</span>
                  <p className="text-4xl font-black tracking-tighter mt-1">{stat.value}</p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-4 sm:gap-6 text-center md:text-left items-center md:items-start"
        >
          <Badge className="w-fit rounded-full bg-primary/10 text-primary border-primary/20 font-black px-4 py-1.5 text-[10px] uppercase tracking-widest">
            Core Engine
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none">THE FUTURE OF <br className="hidden sm:block" /> CAMPUS FLOW</h2>
          <p className="text-muted-foreground font-medium text-base sm:text-lg">
            We bridge the gap between students and infrastructure through real-time data and smart scheduling.
          </p>
          <Button variant="link" className="text-primary font-black p-0 w-fit text-base sm:text-lg hover:neon-text transition-all">
            LEARN MORE <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
        
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {[
            {
              title: "Real-time Tracking",
              desc: "Instantly see which rooms are occupied and which are free for your next session.",
              icon: Zap,
            },
            {
              title: "Smart Suggestions",
              desc: "AI-driven recommendations for the best times and locations based on your needs.",
              icon: BarChart3,
            },
            {
              title: "Secure Bookings",
              desc: "Prevent double bookings and manage your schedule with our robust authentication system.",
              icon: Shield,
            },
            {
              title: "Analytics Dashboard",
              desc: "Deep insights into campus resource utilization for administrators and students.",
              icon: BarChart3,
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] flex flex-col gap-4 sm:gap-5 border border-border hover:border-primary/30 transition-all group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary/60 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-2">{feature.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed text-sm sm:text-base">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
