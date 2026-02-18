// App.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { supabase } from './lib/supabase';

import SplashScreen from './screens/SplashScreen';
import Login from './screens/Login';
import Register from './screens/Register';
import ForgotPassword from './screens/ForgotPassword';
import Dashboard from './screens/Dashboard';
import DeliveryDetailScreen from './screens/DeliveryDetailScreen';
import ProofOfDeliveryScreen from './screens/ProofOfDeliveryScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import EditProfileScreen from './screens/EditProfileScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [session, setSession] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [screenParams, setScreenParams] = useState({});
  const locationSub = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) fetchDriver(s.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) {
        setDriverProfile(null);
        setCurrentScreen('login');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchDriver = async (uid) => {
    const { data } = await supabase.from('drivers').select('*').eq('user_id', uid).maybeSingle();
    if (data && (data.status === 'active' || data.status === 'approved' || data.status === 'inactive')) {
      setDriverProfile(data);
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('login');
    }
  };

  const navigate = useCallback((screen, params = {}) => {
    setScreenParams(params);
    setCurrentScreen(screen);
  }, []);

  const handleLoginSuccess = useCallback((profile) => {
    setDriverProfile(profile);
    setCurrentScreen('dashboard');
  }, []);

  const handleLogout = useCallback(async () => {
    if (driverProfile) {
      await supabase.from('drivers').update({ online_status: 'offline' }).eq('id', driverProfile.id);
    }
    await supabase.auth.signOut();
    setDriverProfile(null);
    setSession(null);
    setCurrentScreen('login');
  }, [driverProfile]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return (
          <SplashScreen
            onComplete={() => setCurrentScreen(session && driverProfile ? 'dashboard' : 'login')}
          />
        );
      case 'login':
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => navigate('register')}
            onNavigateToForgotPassword={() => navigate('forgotPassword')}
          />
        );
      case 'register':
        return <Register onNavigateToLogin={() => navigate('login')} />;
      case 'forgotPassword':
        return <ForgotPassword onNavigateToLogin={() => navigate('login')} />;
      case 'dashboard':
        return (
          <Dashboard
            session={session}
            driverProfile={driverProfile}
            setDriverProfile={setDriverProfile}
            onLogout={handleLogout}
            onViewDelivery={(d) => navigate('deliveryDetail', { delivery: d })}
            onViewNotifications={() => navigate('notifications')}
          />
        );
      case 'deliveryDetail':
        return (
          <DeliveryDetailScreen
            session={session}
            driverProfile={driverProfile}
            delivery={screenParams.delivery}
            onBack={() => navigate('dashboard')}
            onProofOfDelivery={(d) => navigate('proofOfDelivery', { delivery: d })}
          />
        );
      case 'proofOfDelivery':
        return (
          <ProofOfDeliveryScreen
            session={session}
            driverProfile={driverProfile}
            delivery={screenParams.delivery}
            onComplete={() => navigate('dashboard')}
            onBack={() => navigate('deliveryDetail', { delivery: screenParams.delivery })}
          />
        );
      case 'notifications':
        return (
          <NotificationsScreen
            session={session}
            driverProfile={driverProfile}
            onBack={() => navigate('dashboard')}
          />
        );
      default:
        return <Login onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => navigate('register')} onNavigateToForgotPassword={() => navigate('forgotPassword')} />;
    }
  };

  return (
    <>
      <StatusBar style={currentScreen === 'splash' ? 'light' : 'dark'} />
      {renderScreen()}
    </>
  );
}