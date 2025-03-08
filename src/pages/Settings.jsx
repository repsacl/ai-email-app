// src/pages/Settings.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Separator />
      <div className="space-y-4">
        <Skeleton className="h-4 w-[250px]" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function Settings() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    displayName: '',
    emailNotifications: true,
    darkMode: false,
    autoSync: true
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUserAndSettings() {
      try {
        setLoading(true);
        
        // Get user information
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        setUser(data.user);
        
        // We would normally fetch user settings from a database
        // But for now we'll just use defaults/mock data
        setSettings({
          displayName: data.user.user_metadata?.full_name || '',
          emailNotifications: true,
          darkMode: false,
          autoSync: true
        });
      } catch (err) {
        console.error('Error loading user settings:', err);
        setError('Could not load settings. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    loadUserAndSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    
    try {
      // Here we would normally save settings to database
      // For now, we'll just simulate success
      
      // Update user profile if display name has changed
      if (settings.displayName !== user.user_metadata?.full_name) {
        const { error } = await supabase.auth.updateUser({
          data: { full_name: settings.displayName }
        });
        
        if (error) throw error;
      }
      
      // Simulate saving other settings
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSuccess(true);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-2 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake til dashboard
          </Button>
        </div>
        <CardTitle>Innstillinger</CardTitle>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <SettingsSkeleton />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert>
                <AlertDescription>Innstillingene ble lagret.</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="displayName">Visningsnavn</Label>
              <Input 
                id="displayName"
                value={settings.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
                placeholder="Ditt navn"
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Varsler</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">E-postvarsler</Label>
                  <div className="text-sm text-muted-foreground">
                    Motta varsler på e-post
                  </div>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoSync">Automatisk synkronisering</Label>
                  <div className="text-sm text-muted-foreground">
                    Synkroniser e-poster automatisk
                  </div>
                </div>
                <Switch
                  id="autoSync"
                  checked={settings.autoSync}
                  onCheckedChange={(checked) => handleChange('autoSync', checked)}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-end">
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                Lagre innstillinger
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default Settings;