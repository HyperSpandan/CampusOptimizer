import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Calendar, Settings, Box, Home, User, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
      className="fixed top-4 sm:top-6 left-0 right-0 z-50 px-4 sm:px-6"
    >
      <nav className="max-w-7xl mx-auto h-16 sm:h-20 glass rounded-2xl sm:rounded-[2rem] border border-border flex items-center justify-between px-4 sm:px-8 shadow-2xl">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg sm:rounded-xl flex items-center justify-center group-hover:neon-glow transition-all group-hover:scale-110">
            <Box className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          <span className="font-black text-lg sm:text-2xl tracking-tighter">
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

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">{userRole}</span>
                <span className="text-xs font-bold truncate max-w-[100px]">{user.displayName}</span>
              </div>
              <Button 
                onClick={() => logout()}
                variant="ghost" 
                size="icon"
                className="rounded-xl h-10 w-10 sm:h-11 sm:w-11 glass border-border hover:text-destructive"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleLogin}
              className="rounded-xl bg-primary text-primary-foreground font-black text-[10px] sm:text-xs uppercase tracking-widest px-4 sm:px-6 h-10 sm:h-11 hover:neon-glow transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden xs:inline">Sign In</span>
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded-xl h-10 w-10 sm:h-11 sm:w-11 glass border-border"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 glass rounded-[2rem] border border-border overflow-hidden shadow-2xl"
          >
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Navigation</span>
                <ThemeToggle />
              </div>
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                      isActive ? "bg-primary text-primary-foreground neon-glow" : "glass-dark text-muted-foreground hover:text-primary"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
              {user && (
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 px-6">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-black text-xs">
                    {user.displayName?.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-xs uppercase tracking-tight">{user.displayName}</span>
                    <span className="text-[10px] text-muted-foreground font-bold">{userRole}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
