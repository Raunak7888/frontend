// src/components/ForgotPasswordPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/auth/forget', { email });

      if (response.status === 200) {
        setMessage('Check your email for a password reset link!');
        navigate('/reset');
      }
    } catch (err) {
      setError('Error sending reset link. Please try again.');
      console.error('Forgot password error:', err);
    }
  };

  return (
    <div className="center">
      <div className="card">
        <form onSubmit={handleForgotPassword}>
          <h2 className='heading-secondary'>Forgot Password</h2>
          <div>
            <label className="label"  >Email:</label>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <button className='card-button' type="submit">Send Reset Link</button>
          {message && <p className="message-success">{message}</p>}
          {error && <p className="message-error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
