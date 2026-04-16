import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/storage';
import useLocalStorage from '../hooks/useLocalStorage';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [, setIsAuth] = useLocalStorage('isAuth', false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(username, password);
      if (response.success) {
        setIsAuth(true);
        navigate('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Connection error or invalid credentials');
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <div className="card shadow-xl border-0 p-5 bg-white" style={{ maxWidth: '420px', width: '90%', borderRadius: '24px' }}>
        <div className="text-center mb-5">
           <div className="bg-primary p-3 rounded-xl d-inline-block mb-4 shadow-sm">
              <img src="/logo sri vignesh transports.png" alt="SVT" style={{ width: '48px', height: '48px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
           </div>
           <h2 className="fw-800 mb-1" style={{ color: 'var(--text-main)', letterSpacing: '-0.8px', fontSize: '1.8rem' }}>Sri Vignesh Transports</h2>
      
        </div>
        
        {error && <div className="alert alert-danger border-0 small fw-700 py-3 mb-4 text-center" style={{ borderRadius: '12px' }}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="form-label text-muted small fw-800">OPERATOR IDENTITY</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-0 py-3"><i className="bi bi-person-circle text-primary opacity-50"></i></span>
              <input 
                type="text" 
                className="form-control border-0 bg-light py-3" 
                placeholder="Identification Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ fontSize: '0.9rem', fontWeight: '600' }}
              />
            </div>
          </div>
          <div className="mb-5">
            <label className="form-label text-muted small fw-800">SECURITY TOKEN</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-0 py-3"><i className="bi bi-shield-lock text-primary opacity-50"></i></span>
              <input 
                type="password" 
                className="form-control border-0 bg-light py-3" 
                placeholder="Access Key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ fontSize: '0.9rem', fontWeight: '600' }}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100 py-3 fw-800 shadow-md border-0" style={{ fontSize: '0.9rem', letterSpacing: '0.05em' }}>
            INITIATE SECURE SESSION
          </button>
          
         
        </form>
      </div>
    </div>
  );
};

export default Login;
