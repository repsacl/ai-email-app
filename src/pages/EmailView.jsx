// src/pages/EmailView.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { ArrowLeft, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// New EmailContent component that uses iframe to isolate HTML content
function EmailContent({ htmlContent }) {
  const iframeRef = useRef(null);
  
  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      doc.body.innerHTML = htmlContent || '<p>No content</p>';
      
      // Add base styling to iframe content
      const style = doc.createElement('style');
      style.textContent = `
        body { 
          font-family: system-ui, sans-serif; 
          margin: 0; 
          padding: 0; 
          max-width: 100%;
          word-break: break-word;
          color: inherit;
        }
        img { max-width: 100%; height: auto; }
        a { color: #0066cc; }
        
        /* Add dark mode support */
        @media (prefers-color-scheme: dark) {
          body { color: #e1e1e1; }
          a { color: #3399ff; }
        }
      `;
      doc.head.appendChild(style);
      
      // Adjust iframe height to content
      iframeRef.current.style.height = `${doc.body.scrollHeight + 20}px`;
    }
  }, [htmlContent]);
  
  return (
    <iframe
      ref={iframeRef}
      title="Email content"
      className="w-full border-none"
      style={{ 
        minHeight: '150px',
        width: '100%',
        display: 'block'
      }}
      sandbox="allow-same-origin"
    />
  );
}

function EmailSkeleton() {
  return (
    <div className="space-y-4 p-3 md:p-6">
      <Button variant="ghost" disabled>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
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
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use ID from prop if available (embedded mode), otherwise from URL parameters
  const id = propId || params.id;
  
  // Determine the correct "back" action based on mode
  const handleBack = () => {
    if (isEmbedded && onBack) {
      onBack(); // Use callback in embedded mode
    } else {
      // For standalone mode, use routing
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    async function fetchEmail() {
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch email details from Supabase
        const { data, error } = await supabase
          .from('emails')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        setEmail(data);
      } catch (error) {
        console.error('Error fetching email:', error);
        setError('Could not load email. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchEmail();
  }, [id]);

  // Helper functions for displaying email
  function getInitialColor(name) {
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", 
      "bg-yellow-500", "bg-purple-500", "bg-pink-500",
      "bg-indigo-500", "bg-teal-500"
    ];
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < name?.length || 0; i++) {
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
    
    // Use responsive formatting based on component width instead of device size
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Determine if we should show content in a Card (standalone) or directly (embedded)
  const EmailContentComponent = () => {
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
          <AlertDescription>Email not found.</AlertDescription>
        </Alert>
      );
    }

    const initials = getInitials(email.from_name, email.from_email);
    const avatarColorClass = getInitialColor(email.from_name || email.from_email);

    return (
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Only show back button in standalone mode */}
        {!isEmbedded && (
          <Button variant="ghost" onClick={handleBack} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}

        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{email.subject}</h1>
          
          <div className="flex gap-3 md:gap-4 items-start mb-4 md:mb-6">
            <Avatar className={`${avatarColorClass} text-white h-10 w-10 flex items-center justify-center flex-shrink-0`}>
              <span>{initials}</span>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:justify-between">
                <div className="overflow-hidden text-ellipsis">
                  <div className="font-medium text-lg truncate">
                    {email.from_name || email.from_email}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {email.from_email}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDateTime(email.received_at)}
                </div>
              </div>
              
              <div className="mt-1 text-sm text-muted-foreground truncate">
                To: {email.to_email}
              </div>
            </div>
          </div>
          
          <Separator className="my-4 md:my-6" />
          
          {/* Updated email content section with iframe isolation */}
          <div className="prose max-w-none dark:prose-invert">
            {email.body_html ? (
              <EmailContent htmlContent={email.body_html} />
            ) : (
              <pre className="whitespace-pre-wrap font-sans">
                {email.body_text || 'No content'}
              </pre>
            )}
          </div>
        </div>
      </div>
    );
  };

  // If embedded, we just return the content
  if (isEmbedded) {
    return <EmailContentComponent />;
  }

  // If standalone, we wrap the content in a Card
  return (
    <Card>
      <CardContent className="p-0">
        <EmailContentComponent />
      </CardContent>
    </Card>
  );
}

export default EmailView;