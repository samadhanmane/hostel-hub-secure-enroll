import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { LogOut, User, Shield } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    // Get studentId from localStorage (set after payment)
    if (user?.role === 'user') {
      setStudentId(localStorage.getItem('studentId'));
    } else {
      setStudentId(null);
    }
  }, [user?.email, user?.role]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => {
            if (user?.role === 'admin') {
              navigate('/admin-dashboard');
            } else {
              navigate('/');
            }
          }}
        >
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold">Hostel Hub</h1>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{user.email}</span>
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                {user.role}
              </span>
            </div>
            {user.role === 'user' && studentId && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-mono">ID: {studentId}</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;