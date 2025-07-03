import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  email: string;
  role: 'student' | 'admin';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'student' | 'admin') => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock authentication for demonstration
export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage for demo)
    const savedUser = localStorage.getItem('hostel_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'student' | 'admin'): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock login logic - in real app, this would be an API call
    try {
      if (role === 'admin' && email === 'admin@hostelhub.com' && password === 'admin123') {
        const adminUser: User = {
          id: 'admin-1',
          email,
          role: 'admin',
          name: 'System Administrator'
        };
        setUser(adminUser);
        localStorage.setItem('hostel_user', JSON.stringify(adminUser));
        setIsLoading(false);
        return true;
      } else if (role === 'student') {
        // For students, just create a user with their email
        const studentUser: User = {
          id: `student-${Date.now()}`,
          email,
          role: 'student',
          name: email.split('@')[0]
        };
        setUser(studentUser);
        localStorage.setItem('hostel_user', JSON.stringify(studentUser));
        setIsLoading(false);
        return true;
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
  };

  return {
    user,
    login,
    logout,
    isLoading
  };
};