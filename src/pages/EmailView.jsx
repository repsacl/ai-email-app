// src/pages/EmailView.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { ArrowLeft, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

function EmailSkeleton() {
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

function EmailView({ id: propId, onBack, isEmbedded = false }) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Bruk ID fra prop hvis tilgjengelig (innebygd modus), ellers fra URL-parametre
  const id = propId || params.id;
  
  // Bestem riktig "tilbake" URL basert på modus
  const handleBack = () => {
    if (isEmbedded && onBack) {
      onBack(); // Bruk callback i innebygd modus
    } else {
      // For frittstående modus, bruk routering
      const backUrl = location.pathname.includes('/inbox/email') 
        ? '/dashboard/inbox' 
        : '/dashboard';
      navigate(backUrl);
    }
  };

  useEffect(() => {
    // Oppdater isMobile når vindusstørrelsen endres
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    async function fetchEmail() {
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Hent e-postdetaljer fra Supabase
        const { data, error } = await supabase
          .from('emails')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        setEmail(data);
      } catch (error) {
        console.error('Feil ved henting av e-post:', error);
        setError('Kunne ikke laste inn e-post. Vennligst prøv igjen senere.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchEmail();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [id]);

  // Hjelpefunksjoner for visning av e-post
  function getInitialColor(name) {
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", 
      "bg-yellow-500", "bg-purple-500", "bg-pink-500",
      "bg-indigo-500", "bg-teal-500"
    ];
    
    // Enkel hash-funksjon
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }

  function getInitials(name, email) {
    if (name && name.length > 0) {
      const nameParts = name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return name[0].toUpperCase();
    }
    
    if (email) {
      return email[0].toUpperCase();
    }
    
    return "?";
  }

  function formatDateTime(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Forenklet format for mobil
    if (isMobile) {
      return date.toLocaleDateString([], { 
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Fullt format for desktop
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Bestem om vi skal vise innhold i en Card (frittstående) eller direkte (innebygd)
  const EmailContent = () => {
    if (loading) {
      return <EmailSkeleton />;
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!email) {
      return (
        <Alert>
          <AlertDescription>E-post ikke funnet.</AlertDescription>
        </Alert>
      );
    }

    const initials = getInitials(email.from_name, email.from_email);
    const avatarColorClass = getInitialColor(email.from_name || email.from_email);

    return (
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Vis tilbake-knapp alltid i innebygd modus eller frittstående modus */}
        {!isEmbedded && (
          <Button variant="ghost" onClick={handleBack} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake
          </Button>
        )}

        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{email.subject}</h1>
          
          <div className="flex gap-3 md:gap-4 items-start mb-4 md:mb-6">
            <Avatar className={`${avatarColorClass} text-white h-8 w-8 md:h-10 md:w-10 flex items-center justify-center flex-shrink-0`}>
              <span>{initials}</span>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <div className="overflow-hidden text-ellipsis">
                  <div className="font-medium text-lg truncate">
                    {email.from_name || email.from_email}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground truncate">
                    {email.from_email}
                  </div>
                </div>
                <div className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                  {formatDateTime(email.received_at)}
                </div>
              </div>
              
              <div className="mt-1 text-xs md:text-sm text-muted-foreground truncate">
                Til: {email.to_email}
              </div>
            </div>
          </div>
          
          <Separator className="my-4 md:my-6" />
          
          <div className="prose max-w-none dark:prose-invert text-sm md:text-base">
            {email.body_html ? (
              <div 
                dangerouslySetInnerHTML={{ __html: email.body_html }} 
                className="overflow-x-auto"
                style={{ maxWidth: '100%' }}
              />
            ) : (
              <pre className="whitespace-pre-wrap font-sans">
                {email.body_text || 'Ingen innhold'}
              </pre>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Hvis innebygd, returnerer vi bare innholdet
  if (isEmbedded) {
    return <EmailContent />;
  }

  // Hvis frittstående, legger vi innholdet i et Card
  return (
    <Card>
      <CardContent className="p-0">
        <EmailContent />
      </CardContent>
    </Card>
  );
}

export default EmailView;