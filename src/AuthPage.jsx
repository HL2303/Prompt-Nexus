import React, { useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom'; // Import useLocation
import './AuthPage.css';

const API_URL = 'http://localhost:5001/api/auth';

function AuthPage({ onLoginSuccess }) {
  const location = useLocation(); // Get the location object to read navigation state

  // Check for the 'showSignup' state passed from the landing page.
  // If it's true, default to signup mode. Otherwise, default to login mode.
  const [isLoginMode, setIsLoginMode] = useState(!location.state?.showSignup);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!isLoginMode && !name) || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');
    setRegistrationSuccess(false);

    const endpoint = isLoginMode ? '/login' : '/register';
    const payload = isLoginMode ? { email, password } : { name, email, password };

    try {
      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      
      if (isLoginMode) {
        // If logging in, handle the token as before
        onLoginSuccess(response.data.token);
      } else {
        // If registering, show the success message
        setRegistrationSuccess(true);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'An error occurred.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // If registration was successful, show the "Check your email" message
  if (registrationSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Check Your Inbox</h1>
          <p className="auth-subtitle">
            We've sent a verification link to your email address. Please click the link to activate your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">{isLoginMode ? 'Welcome Back' : 'Create Account'}</h1>
        <p className="auth-subtitle">{isLoginMode ? 'Sign in to continue' : 'Get started with your new account'}</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLoginMode && (
            <div className="input-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required />
            </div>
          )}
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Loading...' : (isLoginMode ? 'Login' : 'Create Account')}
          </button>
        </form>
        <div className="toggle-auth">
          <p>
            {isLoginMode ? "Don't have an account?" : 'Already have an account?'}
            <button onClick={() => setIsLoginMode(!isLoginMode)}>{isLoginMode ? 'Sign Up' : 'Login'}</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
