import React, { useState } from 'react';
import axios from '../api/axios';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/auth/login', { email, password: pwd });
      localStorage.setItem('token', data.token);
      window.location.href = '/';
    } catch (err: any) {
      alert(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 320, margin: 'auto', marginTop: 100 }}>
      <h2>ODSP Login</h2>
      <form onSubmit={handleLogin}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /><br />
        <input placeholder="Password" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} required /><br />
        <button type="submit" disabled={loading}>Login</button>
      </form>
    </div>
  );
};

export default Login;