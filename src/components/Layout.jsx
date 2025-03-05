// src/components/Layout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Mail, Menu, LogOut, Inbox, Settings, User, Home } from "lucide-react";

function Layout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Hent brukerinformasjon
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data && data.user) {
        setUser(data.user);
      }
    });
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Feil ved utlogging:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="container flex h-16 items-center justify-between py-4 mx-4">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
                    <Mail className="h-5 w-5" />
                    E-post App
                  </Link>
                  <Link to="/" className="flex items-center gap-2 text-sm">
                    <Home className="h-4 w-4" />
                    Hjem
                  </Link>
                  <Link to="/dashboard" className="flex items-center gap-2 text-sm">
                    <Inbox className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link to="/dashboard/inbox" className="flex items-center gap-2 text-sm pl-6">
                    <Mail className="h-4 w-4" />
                    Innboks
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    disabled={loading}
                    className="flex items-center gap-2 text-sm justify-start"
                  >
                    <LogOut className="h-4 w-4" />
                    Logg ut
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
            
            <Link to="/" className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <span className="font-bold hidden md:inline-block">E-post App</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-sm hidden md:block">
                {user.email}
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              disabled={loading}
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" /> 
                  Logg ut
                </>
              )}
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex">
        <aside className="w-[240px] border-r h-[calc(100vh-64px)] p-4 hidden md:block sticky top-16">
          <nav className="flex flex-col gap-2">
            {/* <Link to="/">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="h-4 w-4 mr-2" />
                Hjem
              </Button>
            </Link> */}
            
            <Link to="/dashboard">
              <Button variant="ghost" className="w-full justify-start text-lg">
                <Inbox className="h-4 w-4 mr-2" />
                Inbox
              </Button>
            </Link>
            
            {/* <Link to="/dashboard/inbox">
              <Button variant="ghost" className="w-full justify-start ml-4">
                <Mail className="h-4 w-4 mr-2" />
                Innboks
              </Button>
            </Link> */}
            
            <Link to={`/dashboard/profile/${user && user.id}`}>
              <Button variant="ghost" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                {user && user.user_metadata ? user.user_metadata.full_name : 'Profil'}
              </Button>
            </Link>

            <Button variant="ghost" className="w-full justify-start" disabled>
              <Settings className="h-4 w-4 mr-2" />
              Innstillinger
            </Button>
          </nav>
        </aside>
        
        <main className="flex-1 container py-6 mx-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;