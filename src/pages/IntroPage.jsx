// src/pages/IntroPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { motion } from 'motion/react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Mail, ArrowRight, Inbox, Clock, Shield, Zap } from "lucide-react";

function IntroPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "Smart Inbox",
      description: "Organiser automatisk e-postene dine basert på prioritet og type",
      icon: <Inbox className="h-6 w-6" />,
      color: "bg-blue-500/20",
      textColor: "text-blue-500"
    },
    {
      title: "Sanntidssynkronisering",
      description: "Få øyeblikkelig varsling om nye e-poster på alle enheter",
      icon: <Clock className="h-6 w-6" />,
      color: "bg-purple-500/20",
      textColor: "text-purple-500"
    },
    {
      title: "Sikkert og privat",
      description: "End-to-end kryptering beskytter dine sensitive meldinger",
      icon: <Shield className="h-6 w-6" />,
      color: "bg-green-500/20",
      textColor: "text-green-500"
    },
    {
      title: "Lynrask ytelse",
      description: "Naviger og søk i tusenvis av e-poster uten forsinkelse",
      icon: <Zap className="h-6 w-6" />,
      color: "bg-amber-500/20",
      textColor: "text-amber-500"
    }
  ];

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

    // Rotate features automatically
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Mail className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <header className="text-center space-y-6 py-12">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex p-4 rounded-full bg-primary/10 backdrop-blur-sm"
          >
            <Mail className="h-16 w-16 text-primary" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-6xl md:text-8xl font-bold tracking-tight"
          >
            repsac
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            En moderne app for å håndtere e-postene dine enklere og mer effektivt.
          </motion.p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="max-w-5xl mx-auto mb-16"
        >
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="relative"
              >
                <Card className={`h-full border border-border/60 ${index === activeFeature ? 'ring-2 ring-primary/60' : ''} backdrop-blur-sm transition-all duration-300 hover:shadow-lg`}>
                  <CardHeader>
                    <div className={`p-2 rounded-lg ${feature.color} w-fit mb-2`}>
                      {feature.icon}
                    </div>
                    <CardTitle className={feature.textColor}>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="relative rounded-xl overflow-hidden max-w-4xl mx-auto mb-16 shadow-2xl"
        >
          <div className="aspect-[16/9] bg-gradient-to-tr from-primary/40 to-blue-900/90 flex items-center justify-center">
            <div className="px-6 py-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Effektiv e-posthåndtering</h2>
              <p className="text-lg text-white/90 mb-6 max-w-xl mx-auto">
                Gjenvinne kontrollen over innboksen din med våre kraftige funksjoner. 
                Slutt å kaste bort tid på e-post og bruk mer tid på det som virkelig betyr noe.
              </p>
              {session ? (
                <Button asChild variant="secondary" size="lg" className="gap-2">
                  <Link to="/dashboard">
                    Sjekk din innboks nå <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="secondary" size="lg" className="gap-2">
                  <Link to="/login">
                    Prøv det gratis <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex justify-center mt-12"
        >
          {session ? (
            <Button asChild size="lg" className="gap-2 px-8 py-6 text-lg">
              <Link to="/dashboard">
                Gå til dashbordet <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="gap-2 px-8 py-6 text-lg">
              <Link to="/login">
                Logg inn med Google <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </motion.div>

        <footer className="mt-24 text-center text-sm text-muted-foreground">
          <p>© 2025 repsac. Alle rettigheter reservert.</p>
        </footer>
      </div>
    </div>
  );
}

export default IntroPage;