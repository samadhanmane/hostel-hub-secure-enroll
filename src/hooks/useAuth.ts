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
      if (role === 'student') {
        // Allow any email to proceed
        const studentUser = {
          id: '', // No studentId yet
          email,
          role: 'student',
          name: email.split('@')[0]
        };
        setUser(studentUser);
        localStorage.setItem('hostel_user', JSON.stringify(studentUser));
        localStorage.setItem('token', 'demo-student-token');
        localStorage.setItem('role', 'user');
        setIsLoading(false);
        return true;
      }
      if (role === 'admin') {
        // Demo admin credentials
        if (email === 'admin@hostelhub.com' && password === 'admin123') {
          const adminUser = {
            id: 'admin',
            email,
            role: 'admin',
            name: 'Admin'
          };
          setUser(adminUser);
          localStorage.setItem('hostel_user', JSON.stringify(adminUser));
          localStorage.setItem('token', 'demo-admin-token');
          localStorage.setItem('role', 'admin');
          setIsLoading(false);
          return true;
        } else {
          setIsLoading(false);
          return false;
        }
      }
      setIsLoading(false);
      return false;
    } catch (error) {
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