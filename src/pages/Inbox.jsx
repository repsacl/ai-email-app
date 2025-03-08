// src/pages/Inbox.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { syncEmails } from '@/emailSync';
import EmailView from './EmailView';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Mail, Search, ArrowLeft, ChevronRight, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

function EmailSkeleton() {
  return (
    <div className="p-4 space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
      <Skeleton className="h-5 w-[70%]" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

// EmailViewWrapper component for displaying email content
function EmailViewWrapper({ emailId, onBack }) {
  if (!emailId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Mail className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg mb-2">No email selected</h3>
        <p className="text-muted-foreground">
          Select an email from the list to view it here.
        </p>
      </div>
    );
  }
  
  return <EmailView id={emailId} onBack={onBack} isEmbedded={true} />;
}

function Inbox() {
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const emailListRef = useRef(null);
  const navigate = useNavigate();

  async function fetchEmails() {
    try {
      setLoading(true);
      
      // Fetch emails from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session found');
      
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('user_id', session.user.id)
        .order('received_at', { ascending: false });
        
      if (error) throw error;
      
      setEmails(data || []);
      setFilteredEmails(data || []);
      
      // If we have emails but none selected, select the first one
      if (data && data.length > 0 && !selectedEmailId) {
        setSelectedEmailId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError('Could not load emails. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmails();
    
    // Handle responsiveness for wider screens
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // On mobile, show list by default if no email is selected
        setSidebarVisible(!selectedEmailId);
      } else {
        setSidebarVisible(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Run on initial load
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update filtered emails when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmails(emails);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = emails.filter(email => 
      email.subject?.toLowerCase().includes(query) ||
      email.from_name?.toLowerCase().includes(query) ||
      email.from_email?.toLowerCase().includes(query) ||
      email.body_text?.toLowerCase().includes(query) ||
      email.snippet?.toLowerCase().includes(query)
    );
    
    setFilteredEmails(filtered);
  }, [searchQuery, emails]);

  async function handleSync() {
    try {
      setSyncing(true);
      setError(null);
      await syncEmails();
      await fetchEmails();
    } catch (error) {
      console.error('Sync error:', error);
      setError('Error during synchronization. Please try again later.');
    } finally {
      setSyncing(false);
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    
    // If the email is from today, show only the time
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If the email is from this year, show day and month
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
    
    // Otherwise show the full date
    return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Handle email click
  const handleEmailClick = (emailId) => {
    setSelectedEmailId(emailId);
    
    // On mobile, hide the sidebar when an email is selected
    if (window.innerWidth < 768) {
      setSidebarVisible(false);
    }
  };

  // Handle back button from email view
  const handleBackFromEmail = () => {
    if (window.innerWidth < 768) {
      setSidebarVisible(true);
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Clear search query
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Render email list
  const renderEmailList = () => {
    if (loading) {
      return (
        <div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i}>
              <EmailSkeleton />
              {i < 5 && <Separator />}
            </div>
          ))}
        </div>
      );
    }
    
    if (emails.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-4 text-center h-full">
          <Mail className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-2">No emails found</h3>
          <p className="text-muted-foreground mb-4">
            Click "Sync" to fetch emails from your Gmail account.
          </p>
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? 'Syncing...' : 'Sync now'}
          </Button>
        </div>
      );
    }
    
    if (filteredEmails.length === 0 && searchQuery) {
      return (
        <div className="flex flex-col items-center justify-center p-4 text-center h-full">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-2">No results found</h3>
          <p className="text-muted-foreground mb-4">
            No emails match your search query.
          </p>
          <Button variant="outline" onClick={clearSearch}>
            Clear search
          </Button>
        </div>
      );
    }
    
    return (
      <div className="divide-y" ref={emailListRef}>
        {filteredEmails.map((email) => (
          <div
            key={email.id}
            onClick={() => handleEmailClick(email.id)}
            className={`block hover:bg-accent/50 transition-colors cursor-pointer ${
              selectedEmailId === email.id ? 'bg-accent' : ''
            }`}
          >
            <div className="p-3">
              <div className="flex justify-between items-start">
                <div className="font-medium text-sm truncate max-w-[calc(100%-70px)]">
                  {email.from_name || email.from_email}
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(email.received_at)}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground sm:hidden" />
                </div>
              </div>
              <div className="font-semibold text-sm truncate mb-1">
                {email.subject}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {email.snippet || 'No preview available'}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 h-[calc(100vh-200px)]">
      <div className="flex justify-between items-center mb-2">
        {/* Show back button on mobile when viewing email */}
        {!sidebarVisible ? (
          <Button 
            variant="ghost" 
            onClick={handleBackFromEmail} 
            className="p-0"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back</span>
          </Button>
        ) : (
          <h1 className="text-xl font-bold">Inbox</h1>
        )}
        
        <div className="flex items-center gap-2">
          {/* Only show sync button when sidebar is visible */}
          {sidebarVisible && (
            <Button
              onClick={handleSync}
              disabled={syncing}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{syncing ? 'Syncing...' : 'Sync'}</span>
            </Button>
          )}
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search bar - only show when sidebar is visible */}
      {sidebarVisible && (
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Fikset gap mellom sidebar og e-post, fjernet unødvendig gap */}
      <div className="flex h-full">
        {/* Email list that's conditionally visible */}
        <div 
          className={`
            transition-all duration-300 ease-in-out overflow-hidden
            ${sidebarVisible ? 'w-full md:w-1/3 lg:w-1/4 opacity-100' : 'w-0 opacity-0 hidden md:block md:w-0'}
          `}
        >
          {sidebarVisible && (
            <Card className="h-full overflow-hidden flex flex-col">
              <CardContent className="p-0 overflow-y-auto flex-grow">
                {renderEmailList()}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Email content area */}
        <div 
          className={`
            transition-all duration-300 ease-in-out flex-grow
            ${!sidebarVisible ? 'w-full' : 'w-0 md:w-2/3 lg:w-3/4'}
            ${selectedEmailId && !sidebarVisible ? 'block' : selectedEmailId ? 'hidden md:block' : 'hidden'}
          `}
        >
          {selectedEmailId && (
            <Card className="h-full ml-0 md:ml-4">
              <CardContent className="p-0 h-full overflow-y-auto">
                <EmailViewWrapper 
                  emailId={selectedEmailId} 
                  onBack={handleBackFromEmail} 
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default Inbox;