import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const tok = localStorage.getItem('token');
  return tok ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;