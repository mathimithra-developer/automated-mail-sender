import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Organization } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  loading: boolean;
  checkSession: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  organization: null,
  loading: true,
  checkSession: async () => false,
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkSession = async (): Promise<boolean> => {
    try {
      const res = await api.get('/api/auth/me');
      if (res.user) {
        setUser({
          _id: res.user.userId,
          name: res.user.userName || 'User',
          email: res.user.email,
          role: res.user.role || 'ADMIN',
          organization: res.user.orgId,
        });
        setOrganization({
          _id: res.user.orgId,
          name: res.user.orgName || 'Organization',
          plan: 'pro',
          industry: res.user.orgIndustry,
        });
        setLoading(false);
        return true;
      }
    } catch {
      // Not logged in or session expired
    }
    setUser(null);
    setOrganization(null);
    setLoading(false);
    return false;
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Ignore error
    }
    setUser(null);
    setOrganization(null);
    window.location.href = '/login';
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, organization, loading, checkSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
