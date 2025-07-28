import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const API_URL = 'http://localhost:5001/api';

// --- SVG Icons ---
const ImageIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg> );
const TextIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg> );
const VideoIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg> );
const ProfileIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>);
const ActivityIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>);
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
// **NEW** Icons for Website and Code
const WebsiteIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect><line x1="2" y1="9" x2="22" y2="9"></line><line x1="6" y1="6" x2="6" y2="6"></line><line x1="10" y1="6" x2="10" y2="6"></line></svg>);
const CodeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>);


function Dashboard({ user, history, onLogout, onSelection }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  if (!user) {
    return <div className="loading-screen">Loading Dashboard...</div>;
  }

  const recentHistory = history.slice(0, 5);

  return (
    <div className={`dashboard-container ${isActivityModalOpen ? 'noscroll' : ''}`}>
      <header className="dashboard-header">
        <h1 className="dashboard-brand">Prompt Nexus</h1>
        <div className="header-actions">
          <button className="activity-toggle" onClick={() => setIsActivityModalOpen(true)}>
            <ActivityIcon />
            <span>Recent Activity</span>
          </button>
          <div className="user-menu" ref={dropdownRef}>
            <button className="profile-button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <ProfileIcon />
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <p className="user-name">{user.name}</p>
                  <p className="user-email">{user.email}</p>
                </div>
                <Link to="/profile" className="dropdown-item">Profile</Link>
                <Link to="/pricing" className="dropdown-item">Billing</Link>
                <button onClick={onLogout} className="dropdown-item logout">Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="dashboard-main-content">
        <div className="welcome-section">
          <h2>Welcome back, {user.name}!</h2>
          <p>Let's create something amazing today.</p>
        </div>

        <section className="dashboard-section">
          <h2>Choose a Generator</h2>
          <div className="generator-grid">
            <div className="generator-card" onClick={() => onSelection('image')}><ImageIcon /><h3>Prompt for Image</h3><p>Generate artistic prompts for image AIs.</p></div>
            <div className="generator-card" onClick={() => onSelection('text')}><TextIcon /><h3>Prompt for Text</h3><p>Create story starters and character ideas.</p></div>
            <div className="generator-card" onClick={() => onSelection('video')}><VideoIcon /><h3>Prompt for Video</h3><p>Design scene-by-scene video descriptions.</p></div>
            {/* **NEW** Website UI Card */}
            <div className="generator-card" onClick={() => onSelection('website')}><WebsiteIcon /><h3>Prompt for Website UI</h3><p>Generate detailed prompts for website UI/UX.</p></div>
            {/* **NEW** Code Card */}
            <div className="generator-card" onClick={() => onSelection('code')}><CodeIcon /><h3>Prompt for Code</h3><p>Create prompts for functions and code snippets.</p></div>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card clickable" onClick={() => navigate('/pricing')}>
            <h4>Credits Remaining</h4>
            <p className="stat-value credit">{user.credits.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h4>Prompts Generated</h4>
            <p className="stat-value">{history.length}</p>
          </div>
          <div className="stat-card clickable" onClick={() => navigate('/pricing')}>
            <h4>Current Plan</h4>
            <p className="stat-value plan">{user.plan}</p>
          </div>
        </section>
      </main>

      {isActivityModalOpen && (
        <div className="activity-modal-overlay" onClick={() => setIsActivityModalOpen(false)}>
          <div className="activity-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="activity-modal-header">
              <h3>Recent Activity</h3>
              <button onClick={() => setIsActivityModalOpen(false)} className="close-modal-btn"><CloseIcon /></button>
            </div>
            <div className="activity-list">
              {recentHistory.length > 0 ? (
                recentHistory.map(item => (
                  <div key={item._id} className="activity-item">
                    <p className="activity-item-original">{item.originalText}</p>
                    <span className="activity-item-type">{item.promptType}</span>
                  </div>
                ))
              ) : (
                <p className="no-activity">You haven't generated any prompts yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
