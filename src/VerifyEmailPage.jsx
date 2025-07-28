import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import './VerifyEmailPage.css'; // We'll create this next

const API_URL = 'http://localhost:5001/api/auth';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setVerificationStatus('error');
      setMessage('No verification token found. Please check your link.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await axios.post(`${API_URL}/verify-email`, { token });
        setVerificationStatus('success');
        setMessage(response.data.message);
      } catch (error) {
        setVerificationStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <div className="verify-container">
      <div className="verify-card">
        {verificationStatus === 'verifying' && (
          <>
            <h1>Verifying...</h1>
            <p>{message}</p>
          </>
        )}
        {verificationStatus === 'success' && (
          <>
            <h1>Success!</h1>
            <p>{message}</p>
            <Link to="/" className="verify-login-button">Proceed to Login</Link>
          </>
        )}
        {verificationStatus === 'error' && (
          <>
            <h1>Verification Failed</h1>
            <p>{message}</p>
            <Link to="/" className="verify-login-button">Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;
