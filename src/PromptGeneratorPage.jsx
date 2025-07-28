import React, { useState } from 'react';
import axios from 'axios';    
import toast from 'react-hot-toast';
import './PromptGeneratorPage.css';

const API_URL = 'http://localhost:5001/api';

// --- SVG Icons (with full, correct code) ---
const MagicWandIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 4-4-4L7 4" /><path d="m17.5 12.5-8-8a4.95 4.95 0 0 0-7 7l8 8a4.95 4.95 0 0 0 7-7Z" /><path d="m16 8 2-2" /><path d="M9 7 7 9" /><circle cx="11" cy="11" r="2" /></svg>);
const CopyIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>);
const ChevronRightIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>);
const HistoryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>);

function PromptGeneratorPage({ onBack, type, history, refreshHistory, refreshUser }) {
  console.log("DEBUG: [PromptGeneratorPage.jsx] Received history prop with length:", history?.length);

  const [inputText, setInputText] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) {
      toast.error('Please enter some text.');
      return;
    }
    setIsLoading(true);
    setGeneratedPrompt('');
    try {
      const response = await axios.post(`${API_URL}/generate`, { text: inputText, type: type });
      setGeneratedPrompt(response.data.generatedPrompt);
      
      console.log("DEBUG: [PromptGeneratorPage.jsx] ==> Calling refreshHistory and refreshUser...");
      await refreshHistory();
      await refreshUser(); 
      console.log("DEBUG: [PromptGeneratorPage.jsx] <== Finished refreshing data.");

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate prompt.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (textToCopy) => {
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Prompt copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy.');
    }
  };
  
  const handleHistoryItemClick = (item) => {
    setInputText(item.originalText);
    setGeneratedPrompt(item.generatedPrompt);
    if (window.innerWidth <= 768) {
      setIsSidebarExpanded(false);
    }
  };

  const clearAll = () => {
    setInputText('');
    setGeneratedPrompt('');
  };
  
  const pageTitle = type ? type.charAt(0).toUpperCase() + type.slice(1) : "Prompt";

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">{pageTitle} Prompt Generator</h1>
          <p className="app-subtitle">Transform simple ideas into detailed, powerful prompts</p>
        </div>
        <div className="header-actions">
          <button className="sidebar-toggle" onClick={onBack}>Back</button>
          <button className="sidebar-toggle" onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}>
            <HistoryIcon />
            <span>History</span>
          </button>
        </div>
      </header>
      <div className="app-layout">
        <main className="main-content" style={{ marginRight: isSidebarExpanded && window.innerWidth > 768 ? 'var(--sidebar-width)' : '0' }}>
          <div className="content-grid">
            <section className="input-section">
              <div className="section-header">
                <h2>Input</h2>
                <button type="button" onClick={clearAll} className="clear-button" disabled={!inputText && !generatedPrompt}>
                  Clear All
                </button>
              </div>
              <form onSubmit={handleGenerate} className="input-form">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter your idea here..."
                  className="input-textarea"
                />
                <button type="submit" disabled={isLoading || !inputText.trim()} className="generate-button">
                  <MagicWandIcon />
                  <span>{isLoading ? 'Generating...' : 'Generate Prompt'}</span>
                </button>
              </form>
            </section>
            <section className="output-section">
              <div className="section-header">
                <h2>Generated Prompt</h2>
                {generatedPrompt && !isLoading && (
                  <button onClick={() => copyToClipboard(generatedPrompt)} className="copy-button-card">
                    <CopyIcon /> Copy
                  </button>
                )}
              </div>
              <div className="output-content-container">
                {isLoading ? (
                  <div className="loading-container"><div className="loading-spinner"></div><p>Crafting your prompt...</p></div>
                ) : generatedPrompt ? (
                  <p className="prompt-content">{generatedPrompt}</p>
                ) : (
                  <div className="output-placeholder">
                    <MagicWandIcon />
                    <p>Your enhanced prompt will appear here</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
        <aside className={`sidebar ${isSidebarExpanded ? 'expanded' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-title"><HistoryIcon /><h3>History</h3></div>
            <button className="sidebar-close" onClick={() => setIsSidebarExpanded(false)}><ChevronRightIcon /></button>
          </div>
          <div className="sidebar-content">
            {history.length > 0 ? (
              <div className="history-list">
                {history.map((item, index) => (
                  <div key={item._id || index} className="history-item" onClick={() => handleHistoryItemClick(item)}>
                    <p className="history-original">{item.originalText}</p>
                    <p className="history-generated">{item.generatedPrompt}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-history"><HistoryIcon /><p>No prompts yet</p></div>
            )}
          </div>
        </aside>
        {isSidebarExpanded && <div className="sidebar-overlay" onClick={() => setIsSidebarExpanded(false)} />}
      </div>
    </div>
  );
}

export default PromptGeneratorPage;
