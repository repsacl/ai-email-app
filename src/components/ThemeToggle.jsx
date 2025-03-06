// src/components/ThemeToggle.jsx
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    // Sjekk om tema er lagret i localStorage
    const storedTheme = localStorage.getItem('theme');
    // Sjekk brukerens preferanser hvis ingen tema er lagret
    if (!storedTheme) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return storedTheme;
  });

  // Oppdater HTML data-theme attributt når tema endres
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      aria-label={`Bytt til ${theme === 'dark' ? 'lyst' : 'mørkt'} tema`}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

export default ThemeToggle;