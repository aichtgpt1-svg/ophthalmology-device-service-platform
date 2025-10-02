import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <nav style={{ width: 180, borderRight: '1px solid #ccc', paddingRight: 10 }}>
        <h4>Menu</h4>
        <Link to="/devices">Devices</Link><br />
        <Link to="/services">Service Log</Link><br />
		<Link to="/documents">AI Analyser</Link><br />
        <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}>Logout</button>
		<Link to="/maintenance">Maintenance Calendar</Link><br />
      </nav>
      <main style={{ flex: 1 }}>
        <h1>Dashboard</h1>
        <p>Welcome, {user?.full_name} ({user?.role})</p>
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;