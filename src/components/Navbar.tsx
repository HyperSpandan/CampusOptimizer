import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Calendar, Settings, Box, Home, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { auth, db, signInWithGoogle, logout } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";

export default function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      if (result) {
        toast.success("Signed in successfully!");
      }
    } catch (error: any) {
      if (error.message && !error.message.includes('cancelled') && !error.message.includes('closed')) {
        toast.error(error.message || "Failed to sign in");
      }
    }
  };

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, protected: true },
    { name: "Booking", path: "/booking", icon: Calendar, protected: true },
    { name: "Admin", path: "/admin", icon: Settings, adminOnly: true },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly) return userRole === "admin";
    if (item.protected) return !!user;
    return true;
  });

  return (
    <motion.div 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-6 left-0 right-0 z-50 px-6"
    >
      <nav className="max-w-7xl mx-auto h-20 glass rounded-[2rem] border border-border flex items-center justify-between px-8 shadow-2xl">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:neon-glow transition-all group-hover:scale-110">
            <Box className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-black text-2xl tracking-tighter hidden sm:block">
            CAMPUS<span className="text-primary">OPTIMIZER</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-2 glass-dark p-1.5 rounded-2xl border border-border">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all hover:text-primary flex items-center gap-2 rounded-xl",
                  isActive ? "text-primary bg-white/5" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("w-4 h-4 transition-transform", isActive && "scale-110")} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 border border-primary/20 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">{userRole}</span>
                <span className="text-xs font-bold truncate max-w-[100px]">{user.displayName}</span>
              </div>
              <Button 
                onClick={() => logout()}
                variant="ghost" 
                size="icon"
                className="rounded-xl h-11 w-11 glass border-border hover:text-destructive"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleLogin}
              className="rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest px-6 h-11 hover:neon-glow transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Sign In
            </Button>
          )}
          
          {/* Mobile Menu Toggle (Simplified for now) */}
          <Button variant="ghost" size="icon" className="md:hidden rounded-xl h-11 w-11 glass border-border">
            <LayoutDashboard className="w-5 h-5" />
          </Button>
        </div>
      </nav>
    </motion.div>
  );
}
