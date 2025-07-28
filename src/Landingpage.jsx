import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

// --- SVG Icons ---
const ArrowRightIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>);
const ImageIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg> );
const TextIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg> );
const VideoIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg> );


function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1 className="brand-name">Prompt Nexus</h1>
        <nav className="landing-nav">
          {/* This button navigates to the login form */}
          <button onClick={() => navigate('/auth')} className="nav-button login">Login</button>
          {/* This button navigates and tells the next page to show the signup form */}
          <button onClick={() => navigate('/auth', { state: { showSignup: true } })} className="nav-button signup">Sign Up</button>
        </nav>
      </header>

      <main className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Unleash Your Creativity with AI</h2>
          <p className="hero-subtitle">
            Transform your simple ideas into powerful, detailed prompts for images, text, and video. Get started in seconds.
          </p>
          {/* This button also tells the next page to show the signup form */}
          <button onClick={() => navigate('/auth', { state: { showSignup: true } })} className="hero-cta">
            <span>Get Started for Free</span>
            <ArrowRightIcon />
          </button>
        </div>
      </main>

      <section className="features-section">
        <h3 className="features-title">One Tool for Every Idea</h3>
        <div className="features-grid">
          <div className="feature-card"><ImageIcon /><h4>Image Prompts</h4><p>Generate artistic and photorealistic prompts for AI image generators.</p></div>
          <div className="feature-card"><TextIcon /><h4>Text Prompts</h4><p>Create compelling story starters, character ideas, and more.</p></div>
          <div className="feature-card"><VideoIcon /><h4>Video Prompts</h4><p>Design scene-by-scene descriptions for generative video AIs.</p></div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} Prompt Nexus. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
