// src/pages/EmailView.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { ArrowLeft, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

function EmailSkeleton() {
  // Skeleton code remains the same
  return (
    <div className="space-y-4">
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

function EmailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine the correct "back" URL based on location
  const backUrl = location.pathname.includes('/inbox/email') 
    ? '/dashboard/inbox' 
    : '/dashboard';

  useEffect(() => {
    async function fetchEmail() {
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
  }, [id]);

  // Rest of the component remains largely the same
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
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmailSkeleton />
        </CardContent>
      </Card>
    );
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
    <Card>
      <CardContent className="p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate(backUrl)} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tilbake
        </Button>

        <div>
          <h1 className="text-2xl font-bold mb-6">{email.subject}</h1>
          
          <div className="flex gap-4 items-start mb-6">
            <Avatar className={`${avatarColorClass} text-white h-10 w-10 flex items-center justify-center`}>
              <span>{initials}</span>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <div>
                  <div className="font-medium text-lg">
                    {email.from_name || email.from_email}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {email.from_email}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDateTime(email.received_at)}
                </div>
              </div>
              
              <div className="mt-1 text-sm text-muted-foreground">
                Til: {email.to_email}
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="prose max-w-none dark:prose-invert">
            {email.body_html ? (
              <div dangerouslySetInnerHTML={{ __html: email.body_html }} />
            ) : (
              <pre className="whitespace-pre-wrap font-sans">
                {email.body_text || 'Ingen innhold'}
              </pre>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default EmailView;