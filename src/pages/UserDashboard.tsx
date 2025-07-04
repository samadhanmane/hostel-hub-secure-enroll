import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

const UserDashboard = () => {
  const { user } = useAuth();
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      axios.get(`/api/auth/student/by-email?email=${encodeURIComponent(user.email)}`)
        .then(res => setStudentId(res.data.studentId))
        .catch(() => setStudentId(null));
    }
  }, [user?.email]);

  return (
    <div>
      {studentId && (
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4 text-lg font-bold text-center">
          Your Student ID: {studentId}
        </div>
      )}
      <div>User Dashboard</div>
    </div>
  );
};

export default UserDashboard; 