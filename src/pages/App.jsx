// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

// Pages
import IntroPage from './IntroPage';
import Login from './Login';
import Dashboard from './Dashboard';
import Inbox from './Inbox';
import EmailView from './EmailView';
import ProfileView from './ProfileView';
import Layout from '../components/Layout'

import ErrorPage from './ErrorPage';

import "../App.css"

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sjekk gjeldende session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Sett opp lytter for auth-endringer
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Beskyttet rute-komponent
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="flex justify-center items-center h-screen">Laster...</div>;
    
    if (!session) {
      return <Navigate to="/login" />;
    }
    
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<IntroPage />} />
        <Route path="/login" element={
          !session ? <Login /> : <Navigate to="/dashboard" />
        } />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Inbox />} />
          {/* Vi beholder EmailView-ruten for kompatibilitet, men hovedinteraksjonen vil være i Inbox */}
          <Route path="email/:id" element={<EmailView />} />
          <Route path="profile/:id" element={<ProfileView />} />
        </Route>

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;