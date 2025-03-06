// src/components/Layout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Mail, Menu, LogOut, Inbox, Settings, User, Home, ChevronLeft } from "lucide-react";
import ThemeToggle from './ThemeToggle';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Sjekk om vi er i en dyp rute som trenger tilbakeknapp på mobil
  const needsBackButton = isMobile && (
    location.pathname.includes('/email/') || 
    location.pathname.includes('/profile/')
  );

  // Hent brukerinformasjon
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data && data.user) {
        setUser(data.user);
      }
    });

    // Sjekk skjermstørrelse og oppdaterer state
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const handleBackNavigation = () => {
    if (location.pathname.includes('/email/')) {
      navigate('/dashboard');
    } else if (location.pathname.includes('/profile/')) {
      navigate('/dashboard');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="flex h-14 md:h-16 items-center justify-between px-3 md:px-6">
          <div className="flex items-center gap-2">
            {needsBackButton ? (
              <Button variant="ghost" size="icon" onClick={handleBackNavigation}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
            ) : (
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                  <div className="p-6 border-b">
                    <Link 
                      to="/" 
                      className="flex items-center gap-2 text-lg font-semibold"
                      onClick={() => setIsOpen(false)}
                    >
                      <Mail className="h-5 w-5" />
                      E-post App
                    </Link>
                    {user && (
                      <div className="text-sm text-muted-foreground mt-2 truncate">
                        {user.email}
                      </div>
                    )}
                  </div>
                  <nav className="flex flex-col p-4">
                    <Link 
                      to="/" 
                      className="flex items-center gap-2 text-sm p-3 hover:bg-accent rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      <Home className="h-4 w-4" />
                      Hjem
                    </Link>
                    <Link 
                      to="/dashboard" 
                      className="flex items-center gap-2 text-sm p-3 hover:bg-accent rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      <Inbox className="h-4 w-4" />
                      Innboks
                    </Link>
                    {user && (
                      <Link 
                        to={`/dashboard/profile/${user.id}`}
                        className="flex items-center gap-2 text-sm p-3 hover:bg-accent rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        {user.user_metadata ? user.user_metadata.full_name : 'Profil'}
                      </Link>
                    )}
                    <div className="mt-auto pt-4">
                      <ThemeToggle />
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setIsOpen(false);
                          handleLogout();
                        }}
                        disabled={loading}
                        className="flex items-center gap-2 text-sm justify-start w-full p-3 mt-3"
                      >
                        <LogOut className="h-4 w-4" />
                        Logg ut
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            )}
            
            <Link to="/" className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <span className="font-bold hidden md:inline-block">E-post App</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {user && (
              <div className="text-sm hidden md:block truncate max-w-[180px]">
                {user.email}
              </div>
            )}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              disabled={loading}
              className="hidden sm:flex"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" /> 
                  <span className="hidden md:inline">Logg ut</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex">
        <aside className="w-[240px] border-r h-[calc(100vh-64px)] p-4 hidden md:block sticky top-16">
          <nav className="flex flex-col gap-2">
            <Link to="/dashboard">
              <Button variant="ghost" className="w-full justify-start text-base">
                <Inbox className="h-4 w-4 mr-2" />
                Innboks
              </Button>
            </Link>
            
            {user && (
              <Link to={`/dashboard/profile/${user.id}`}>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  {user.user_metadata ? user.user_metadata.full_name : 'Profil'}
                </Button>
              </Link>
            )}

            <Button variant="ghost" className="w-full justify-start" disabled>
              <Settings className="h-4 w-4 mr-2" />
              Innstillinger
            </Button>
          </nav>
        </aside>
        
        <main className="flex-1 container py-4 md:py-6 px-3 md:px-6 max-w-full md:max-w-7xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;