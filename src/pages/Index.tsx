import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/auth/LoginForm";
import EnrollmentForm from "@/components/student/EnrollmentForm";
import AdminDashboard from "@/components/admin/AdminDashboard";
import Header from "@/components/layout/Header";

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hostel-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {user.role === 'admin' ? <AdminDashboard /> : <EnrollmentForm />}
    </div>
  );
};

export default Index;
