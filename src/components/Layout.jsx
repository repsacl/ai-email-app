// src/components/Layout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

import { Button } from "@/components/ui/button";
import { Mail, Menu, LogOut, Inbox, Settings, User, Home, ChevronLeft, ChevronRight } from "lucide-react";
import ThemeToggle from './ThemeToggle';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch user information
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
      console.error('Error logging out:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <Link to="/" className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <span className="font-bold hidden sm:inline-block">E-post App</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {user && (
              <div className="text-sm hidden md:block truncate max-w-[180px]">
                {user.email}
              </div>
            )}
            <div className="xs:block">
              <ThemeToggle />
            </div>
            {/* Fjernet LogOut knappen fra header */}
          </div>
        </div>
      </header>
      
      <div className="flex relative">
        {/* Collapsible Sidebar */}
        <aside 
          className={`
            border-r bg-background transition-all duration-300 ease-in-out
            fixed md:static h-[calc(100vh-64px)] z-20
            ${sidebarOpen ? 'w-[220px] translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 md:w-[70px]'}
          `}
        >
          <div className={`${sidebarOpen ? 'opacity-100' : 'opacity-0 md:opacity-100'} transition-opacity duration-200 overflow-hidden h-full flex flex-col`}>
            <nav className="flex flex-col gap-2 p-4 flex-grow">
              <Link to="/dashboard">
                <Button variant="ghost" className="w-full justify-start text-base">
                  <Inbox className="h-4 w-4 mr-2" />
                  {sidebarOpen && <span>Innboks</span>}
                </Button>
              </Link>
              
              {user && (
                <Link to={`/dashboard/profile/${user.id}`}>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    {sidebarOpen && (user.user_metadata ? user.user_metadata.full_name : 'Profil')}
                  </Button>
                </Link>
              )}

              <Link to="/dashboard/settings">
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  {sidebarOpen && <span>Innstillinger</span>}
                </Button>
              </Link>
            </nav>
            
            {/* Logg ut knapp i bunnen av sidebar */}
            <div className="p-4 mt-auto">
              <Button 
                variant="ghost" 
                onClick={handleLogout} 
                disabled={loading}
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {sidebarOpen && <span>Logg ut</span>}
              </Button>
            </div>
          </div>
          
          {/* Toggle button for collapsed sidebar on desktop */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleSidebar}
            className="absolute right-0 top-4 translate-x-1/2 hidden md:flex w-6 h-6 p-0 rounded-full border border-border bg-background shadow-sm"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        </aside>
        
        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-background/80 z-10 md:hidden"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}
        
        {/* Fjernet padding på main-container for å unngå horisontal scroll */}
        <main className={`
          flex-1 container py-4 md:py-6 max-w-full overflow-x-hidden mx-3

          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'md:ml-[50px]' : 'md:ml-[50px]'}
        `}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;