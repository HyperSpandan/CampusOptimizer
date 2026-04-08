/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import ResourceDetail from "@/pages/ResourceDetail";
import Booking from "@/pages/Booking";
import AdminPanel from "@/pages/AdminPanel";
import Navbar from "@/components/Navbar";
import AIAssistant from "@/components/AIAssistant";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

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
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="animate-pulse text-primary font-mono">INITIALIZING CAMPUS OPTIMIZER...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/dashboard" 
                element={user ? <Dashboard /> : <Navigate to="/" replace />} 
              />
              <Route 
                path="/resource/:id" 
                element={user ? <ResourceDetail /> : <Navigate to="/" replace />} 
              />
              <Route 
                path="/booking" 
                element={user ? <Booking /> : <Navigate to="/" replace />} 
              />
              <Route 
                path="/admin" 
                element={userRole === "admin" ? <AdminPanel /> : <Navigate to="/dashboard" replace />} 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <AIAssistant />
          <Toaster position="top-right" />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

