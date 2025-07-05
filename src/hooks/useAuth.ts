import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'student' | 'admin') => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthState = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Example: load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('hostel_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = async (email: string, password: string, role: 'student' | 'admin') => {
    setIsLoading(true);
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
      
      if (role === 'admin') {
        // Real admin authentication
        const response = await fetch(`${BACKEND_URL}/api/auth/admin/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        
        if (!response.ok) {
          setIsLoading(false);
          return false;
        }
        
        const data = await response.json();
        const adminUser = {
          id: 'admin',
          email,
          role: 'admin',
          name: 'Admin'
        };
        
        setUser(adminUser);
        localStorage.setItem('hostel_user', JSON.stringify(adminUser));
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', 'admin');
        setIsLoading(false);
        return true;
      }
      
      if (role === 'student') {
        // For student login, we'll use a simplified approach for now
        // In production, you'd want proper student authentication
        const studentUser = {
          id: '', // No studentId yet
          email,
          role: 'student',
          name: email.split('@')[0]
        };
        setUser(studentUser);
        localStorage.setItem('hostel_user', JSON.stringify(studentUser));
        // Generate a temporary token for student (in production, use proper auth)
        localStorage.setItem('token', 'temp-student-token');
        localStorage.setItem('role', 'user');
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hostel_user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return { user, login, logout, isLoading };
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};