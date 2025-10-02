import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from '../api/axios';

interface User { id: string; email: string; full_name: string; role: string }
interface Ctx { user: User | null; login: (t: string) => void; logout: () => void }

const AuthContext = createContext<Ctx>({ user: null, login: () => {}, logout: () => {} });

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (token: string) => {
    localStorage.setItem('token', token);
    const { data } = await axios.get('/users/me');
    setUser(data);
  };

  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);