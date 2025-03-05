// src/pages/ProfileView.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Calendar, User } from "lucide-react";

function ProfileSkeleton() {
  return (
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
  );
}

function ProfileView() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEmails: 0,
    lastSync: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(data.user);
        
        // Fetch user email stats
        const { data: emailsData, error: emailsError } = await supabase
          .from('emails')
          .select('id, received_at')
          .eq('user_id', data.user.id)
          .order('received_at', { ascending: false });
        
        if (emailsError) throw emailsError;
        
        setStats({
          totalEmails: emailsData.length,
          lastSync: emailsData.length > 0 ? new Date(emailsData[0].received_at) : null
        });
      } catch (error) {
        console.error('Feil ved henting av brukerdata:', error);
        setError('Kunne ikke laste inn brukerprofil. Vennligst prøv igjen senere.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUser();
  }, []);

  function formatDate(date) {
    if (!date) return 'Aldri';
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getInitials(name) {
    if (!name) return '?';
    
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  }

  function getInitialColor(name) {
    if (!name) return 'bg-gray-500';
    
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

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <ProfileSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">{error}</div>
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake til dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Bruker ikke funnet.</div>
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake til dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  const userName = user.user_metadata?.full_name || user.email;
  const initials = getInitials(userName);
  const avatarColorClass = getInitialColor(userName);

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tilbake til dashboard
        </Button>

        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Brukerprofil</h1>
          
          <div className="flex gap-4 items-center">
            <Avatar className={`${avatarColorClass} text-white h-16 w-16 flex items-center justify-center`}>
              <span className="text-lg">{initials}</span>
            </Avatar>
            
            <div>
              <div className="font-medium text-xl">
                {user.user_metadata?.full_name || 'Ingen navn'}
              </div>
              <div className="text-muted-foreground">
                {user.email}
              </div>
              {user.user_metadata?.avatar_url && (
                <div className="mt-2">
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Profilbilde" 
                    className="h-16 w-16 rounded-full hidden"
                  />
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Kontodetaljer</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-4 bg-accent/50 rounded-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Bruker-ID</div>
                  <div className="font-medium">{user.id.substring(0, 8)}...</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-4 bg-accent/50 rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Registrert</div>
                  <div className="font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-4 bg-accent/50 rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">E-poster</div>
                  <div className="font-medium">{stats.totalEmails}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-4 bg-accent/50 rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Siste synkronisering</div>
                  <div className="font-medium">{formatDate(stats.lastSync)}</div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Provider-informasjon</h2>
            <div className="bg-accent/50 p-4 rounded-lg">
              <div className="mb-2 text-muted-foreground">Provider</div>
              <div className="font-medium">{user.app_metadata?.provider || 'Ukjent'}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfileView;