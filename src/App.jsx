import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import './App.css';
import './Dashboard.css';
import './PromptGeneratorPage.css';
import './ProfilePage.css';
import './PricingPage.css';
import './VerifyEmailPage.css';
import './LandingPage.css';

import AuthPage from './AuthPage';
import Dashboard from './Dashboard';
import PromptGeneratorPage from './PromptGeneratorPage';
import ProfilePage from './ProfilePage';
import PricingPage from './PricingPage';
import VerifyEmailPage from './VerifyEmailPage';
import LandingPage from './LandingPage';

const API_URL = 'http://localhost:5001/api';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatorType, setGeneratorType] = useState(null);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setToken(null);
    setUser(null);
    setHistory([]);
    navigate('/');
  }, [navigate]);

  const fetchHistory = useCallback(async () => {
    if (localStorage.getItem('token')) {
      try {
        const response = await axios.get(`${API_URL}/prompts`);
        setHistory(response.data);
      } catch (error) {
        setHistory([]);
      }
    }
  }, []);

  const fetchUser = useCallback(async (authToken) => {
    if (!authToken) {
      setIsLoading(false);
      return;
    }
    try {
      axios.defaults.headers.common['x-auth-token'] = authToken;
      const response = await axios.get(`${API_URL}/auth/user`);
      setUser(response.data);
      await fetchHistory();
    } catch (error) {
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  }, [fetchHistory, handleLogout]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    fetchUser(storedToken);
  }, [fetchUser]);

  const handleLoginSuccess = useCallback((newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    fetchUser(newToken);
    navigate('/dashboard');
  }, [navigate, fetchUser]);

  const handleDashboardSelection = useCallback((selection) => {
    setGeneratorType(selection);
    navigate('/generator');
  }, [navigate]);

  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ style: { background: '#333', color: '#fff' } }} />
      <Routes>
        <Route path="/" element={!token ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/auth" element={!token ? <AuthPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/dashboard" replace />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        
        {/* **FIXED**: Added the onLogout prop here */}
        <Route path="/dashboard" element={token ? <Dashboard user={user} history={history} onLogout={handleLogout} onSelection={handleDashboardSelection} /> : <Navigate to="/" replace />} />
        
        <Route path="/generator" element={token ? <PromptGeneratorPage onBack={() => navigate('/dashboard')} type={generatorType} history={history} refreshHistory={fetchHistory} refreshUser={() => fetchUser(token)} /> : <Navigate to="/" replace />} />
        <Route path="/profile" element={token ? <ProfilePage user={user} onLogout={handleLogout} onBack={() => navigate('/dashboard')} refreshUser={() => fetchUser(token)} /> : <Navigate to="/" replace />} />
        <Route path="/pricing" element={token ? <PricingPage user={user} onBack={() => navigate('/dashboard')} refreshUser={() => fetchUser(token)} /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/"} replace />} />
      </Routes>
    </>
  );
}

export default App;
