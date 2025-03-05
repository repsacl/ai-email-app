// src/pages/Inbox.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { syncEmails } from '@/emailSync';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Mail } from "lucide-react";
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

function Inbox() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

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
    } catch (error) {
      console.error('Feil ved henting av e-poster:', error);
      setError('Kunne ikke laste inn e-poster. Vennligst prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmails();
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Innboks</h1>
        <Button
          onClick={handleSync}
          disabled={syncing}
          variant="outline"
          className="gap-2"
        >
          {syncing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Synkroniserer...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Synkroniser
            </>
          )}
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <EmailSkeleton />
                  {i < 5 && <Separator />}
                </div>
              ))}
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">Ingen e-poster funnet</h3>
              <p className="text-muted-foreground mb-4">
                Klikk på "Synkroniser" for å hente e-poster fra din Gmail-konto.
              </p>
              <Button onClick={handleSync} disabled={syncing}>
                {syncing ? 'Synkroniserer...' : 'Synkroniser nå'}
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {emails.map((email) => (
                <Link
                  key={email.id}
                  to={`email/${email.id}`}
                  className="block hover:bg-accent/50 transition-colors"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium truncate max-w-[calc(100%-80px)]">
                        {email.from_name || email.from_email}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(email.received_at)}
                      </div>
                    </div>
                    <div className="font-semibold truncate mb-1">{email.subject}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {email.snippet || 'Ingen forhåndsvisning tilgjengelig'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Inbox;