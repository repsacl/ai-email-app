// src/pages/Inbox.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { syncEmails } from '@/emailSync';
import EmailView from './EmailView';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Mail, ArrowLeft, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

function EmailViewSkeleton() {
  return (
    <div className="space-y-4 p-3 md:p-6">
      <Button variant="ghost" disabled>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Tilbake
      </Button>
      
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}



// EmailViewWrapper komponent for å håndtere visning av EmailView i innboksen
function EmailViewWrapper({ emailId, onBack }) {
  if (!emailId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Mail className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg mb-2">Ingen e-post valgt</h3>
        <p className="text-muted-foreground">
          Velg en e-post fra listen for å vise den her.
        </p>
      </div>
    );
  }
  
  return <EmailView id={emailId} onBack={onBack} isEmbedded={true} />;
}

function Inbox() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [mobileView, setMobileView] = useState("list"); // "list" eller "detail"
  const navigate = useNavigate();
  const location = useLocation();

  async function fetchEmails() {
    try {
      setLoading(true);
      
      // Hent e-poster fra Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Ingen aktiv økt funnet');
      
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('user_id', session.user.id)
        .order('received_at', { ascending: false });
        
      if (error) throw error;
      
      setEmails(data || []);
      
      // Hvis vi har e-poster men ingen er valgt, velg den første på desktop
      if (data && data.length > 0 && !selectedEmailId && window.innerWidth >= 768) {
        setSelectedEmailId(data[0].id);
      }
    } catch (error) {
      console.error('Feil ved henting av e-poster:', error);
      setError('Kunne ikke laste inn e-poster. Vennligst prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmails();
    
    // Legg til en lytter for å oppdatere mobileView basert på vindusbredde
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileView("both"); // desktop visning
      } else {
        // Behold gjeldende visning på mobil
        if (mobileView === "both") {
          setMobileView(selectedEmailId ? "detail" : "list");
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Kjør ved oppstart
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function handleSync() {
    try {
      setSyncing(true);
      setError(null);
      await syncEmails();
      await fetchEmails();
    } catch (error) {
      console.error('Synkroniseringsfeil:', error);
      setError('Feil under synkronisering. Vennligst prøv igjen senere.');
    } finally {
      setSyncing(false);
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    
    // Hvis e-posten er fra i dag, vis kun klokkeslett
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Hvis e-posten er fra i år, vis dag og måned
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
    
    // Ellers vis full dato
    return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Håndterer klikk på e-post
  const handleEmailClick = (emailId) => {
    setSelectedEmailId(emailId);
    // På mobil, bytt til detaljvisning når en e-post er valgt
    if (window.innerWidth < 768) {
      setMobileView("detail");
    }
  };

  // Håndterer tilbake-knappen fra e-post visningen
  const handleBackFromEmail = () => {
    // På mobil, gå tilbake til listevisning
    if (window.innerWidth < 768) {
      setMobileView("list");
    } else {
      setSelectedEmailId(null);
    }
  };

  // Rendrer e-postlisten
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
          <h3 className="font-medium text-lg mb-2">Ingen e-poster funnet</h3>
          <p className="text-muted-foreground mb-4">
            Klikk på "Synkroniser" for å hente e-poster fra din Gmail-konto.
          </p>
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? 'Synkroniserer...' : 'Synkroniser nå'}
          </Button>
        </div>
      );
    }
    
    return (
      <div className="divide-y">
        {emails.map((email) => (
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
                  <ChevronRight className="h-4 w-4 text-muted-foreground md:hidden" />
                </div>
              </div>
              <div className="font-semibold text-sm truncate mb-1">
                {email.subject}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {email.snippet || 'Ingen forhåndsvisning tilgjengelig'}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        {/* På mobil i detaljvisning, vis tilbake-knappen */}
        {mobileView === "detail" && window.innerWidth < 768 ? (
          <Button 
            variant="ghost" 
            onClick={handleBackFromEmail} 
            className="p-0"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Tilbake</span>
          </Button>
        ) : (
          <h1 className="text-xl md:text-2xl font-bold">Innboks</h1>
        )}
        
        {/* Skjul synkroniseringsknappen i detaljvisning på mobil */}
        {mobileView !== "detail" && (
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
            className="gap-2"
            size="sm"
          >
            {syncing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Synkroniserer...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Synkroniser</span>
              </>
            )}
          </Button>
        )}
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className={`flex flex-col md:flex-row gap-3 h-[calc(100vh-200px)]`}>
        {/* E-postliste som vises alltid på desktop, men skjules på mobil i detaljvisning */}
        {(mobileView !== "detail" || window.innerWidth >= 768) && (
          <Card className="md:w-1/3 lg:w-1/4 overflow-hidden flex flex-col">
            <CardContent className="p-0 overflow-y-auto flex-grow">
              {renderEmailList()}
            </CardContent>
          </Card>
        )}

        {/* E-postinnhold som vises alltid på desktop, men kun i detaljvisning på mobil */}
        {(mobileView === "detail" || window.innerWidth >= 768) && selectedEmailId && (
          <Card className="md:w-2/3 lg:w-3/4 flex-grow">
            <CardContent className="p-0 h-full overflow-y-auto">
              <EmailViewWrapper emailId={selectedEmailId} onBack={handleBackFromEmail} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Inbox;