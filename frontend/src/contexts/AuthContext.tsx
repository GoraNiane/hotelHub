import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from '../types/types';
import api from '../services/api';
import { mockDb } from '../services/mockDb';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  register: (firstName: string, lastName: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (firstName: string, lastName: string, phone: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('tph_token');
      const storedUser = localStorage.getItem('tph_current_user');
      
      if (token && storedUser) {
        try {
          // Fetch fresh user profile from the backend to verify token and get updates
          const response = await api.get('/api/auth/me');
          if (response.data && response.data.success) {
            const user = response.data.data;
            setCurrentUser(user);
            localStorage.setItem('tph_current_user', JSON.stringify(user));
          } else {
            throw new Error('Failed to verify token');
          }
        } catch (error) {
          console.error('Authentication verification failed:', error);
          localStorage.removeItem('tph_current_user');
          localStorage.removeItem('tph_token');
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      if (response.data && response.data.success) {
        const { token, user } = response.data.data;
        
        localStorage.setItem('tph_token', token);
        localStorage.setItem('tph_current_user', JSON.stringify(user));
        setCurrentUser(user);
        
        // Refresh local cache for rooms, reservations, etc. using the newly authenticated token/role
        await mockDb.init();
        
        setLoading(false);
        return { success: true, role: user.role };
      } else {
        setLoading(false);
        return { success: false, error: response.data.message || 'Une erreur est survenue lors de la connexion.' };
      }
    } catch (error: any) {
      setLoading(false);
      return { 
        success: false, 
        error: error.message || 'Identifiants incorrects ou serveur indisponible.' 
      };
    }
  };

  const register = async (firstName: string, lastName: string, email: string, phone: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/register', {
        firstName,
        lastName,
        email,
        phone,
        password,
      });

      setLoading(false);
      if (response.data && response.data.success) {
        return { success: true };
      } else {
        return { success: false, error: response.data.message || 'Une erreur est survenue.' };
      }
    } catch (error: any) {
      setLoading(false);
      return { 
        success: false, 
        error: error.message || 'Erreur lors de la création du compte.' 
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('tph_current_user');
    localStorage.removeItem('tph_token');
    
    // Reset database cache to clear private/role-specific information
    mockDb.resetDb();
    
    // Call backend logout endpoint asynchronously (optional)
    api.post('/api/auth/logout').catch(() => {});
  };

  const updateProfile = async (firstName: string, lastName: string, phone: string) => {
    if (!currentUser) return { success: false, error: 'Non authentifié.' };

    setLoading(true);
    try {
      const response = await api.put('/api/auth/profile', {
        firstName,
        lastName,
        phone,
      });

      setLoading(false);
      if (response.data && response.data.success) {
        const updatedUser = response.data.data;
        setCurrentUser(updatedUser);
        localStorage.setItem('tph_current_user', JSON.stringify(updatedUser));
        
        // Refresh local cache to ensure client details match updated profile
        await mockDb.init();
        
        return { success: true };
      } else {
        return { success: false, error: response.data.message || 'Une erreur est survenue.' };
      }
    } catch (error: any) {
      setLoading(false);
      return { 
        success: false, 
        error: error.message || 'Erreur lors de la mise à jour du profil.' 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated: !!currentUser, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
