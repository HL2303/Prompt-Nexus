import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Import toast
import './ProfilePage.css';

const API_URL = 'http://localhost:5001/api';

function ProfilePage({ user, onLogout, onBack, refreshUser }) {
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const hasNameChanged = user && name !== user.name;

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Saving changes...');
    try {
      await axios.put(`${API_URL}/user/profile`, { name });
      toast.success('Name updated successfully!', { id: toastId });
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Changing password...');
    try {
      await axios.put(`${API_URL}/user/password`, { currentPassword, newPassword });
      toast.success('Password changed successfully!', { id: toastId });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="loading-screen">Loading Profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Account Settings</h1>
        <button onClick={onBack} className="profile-back-button">Back to Dashboard</button>
      </div>
      <div className="profile-layout">
        <div className="profile-column">
          <div className="profile-card">
            <h2>Account Details</h2>
            <div className="detail-group"><label>Name</label><p>{user.name}</p></div>
            <div className="detail-group"><label>Email</label><p>{user.email}</p></div>
          </div>
          <div className="profile-card">
            <h2>Subscription Plan</h2>
            <div className="detail-group"><label>Current Plan</label><p className="plan-name">{user.plan}</p></div>
            <div className="detail-group"><label>Credits Remaining</label><p className="profile-credit-count">{user.credits}</p></div>
            <p className="plan-description">Our free plan gives you a starting balance of credits to try out the generator.</p>
            <button className="upgrade-button" onClick={() => navigate('/pricing')}>Upgrade Plan</button>
          </div>
        </div>
        <div className="profile-column">
          <div className="profile-card">
            <h2>Manage Account</h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="input-group">
                <label htmlFor="name">Display Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              {hasNameChanged && (
                <button type="submit" className="profile-button" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </form>
            <hr className="form-divider" />
            <form onSubmit={handlePasswordChange}>
              <div className="input-group"><label htmlFor="currentPassword">Current Password</label><input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></div>
              <div className="input-group"><label htmlFor="newPassword">New Password</label><input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div>
              <div className="input-group"><label htmlFor="confirmPassword">Confirm New Password</label><input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
              <button type="submit" className="profile-button" disabled={loading}>
                {loading ? 'Saving...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="profile-footer">
        <button onClick={onLogout} className="profile-logout-button">Sign Out</button>
      </div>
    </div>
  );
}

export default ProfilePage;
