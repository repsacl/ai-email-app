// src/pages/IntroPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Mail, ArrowRight } from "lucide-react";

function IntroPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Laster...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background p-4">
      <div className="max-w-4xl w-full space-y-12">
        <header className="text-center space-y-4">
          <div className="inline-block p-3 bg-primary/10 rounded-full">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">E-post App</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            En moderne app for å håndtere e-postene dine enklere og mer effektivt.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Enkel håndtering</CardTitle>
              <CardDescription>
                Få bedre oversikt over alle e-postene dine på ett sted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Med vår app kan du enkelt holde orden på alle meldingene dine, 
                uten å måtte bytte mellom forskjellige programmer eller nettleserfaner.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rask synkronisering</CardTitle>
              <CardDescription>
                Alltid oppdatert med de siste e-postene dine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Vår app synkroniserer automatisk med Gmail-kontoen din for å 
                sikre at du alltid har tilgang til de nyeste meldingene.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          {session ? (
            <Button asChild size="lg" className="gap-2">
              <Link to="/dashboard">
                Gå til dashbordet <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="gap-2">
              <Link to="/login">
                Logg inn med Google <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default IntroPage;