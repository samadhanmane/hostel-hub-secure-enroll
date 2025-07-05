import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Shield, GraduationCap, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [studentEmail, setStudentEmail] = useState("");
  const [adminEmail, setAdminEmail] = useState("admin@hostelhub.com");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail) return;

    setIsLoading(true);
    const success = await login(studentEmail, "", "student");
    
    if (success) {
      toast({
        title: "Welcome!",
        description: "Redirecting to enrollment form...",
      });
      navigate("/");
    } else {
      toast({
        title: "Error",
        description: "Failed to access the system. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) return;

    setIsLoading(true);
    const success = await login(adminEmail, adminPassword, "admin");
    
    if (success) {
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin dashboard.",
      });
      navigate("/admin-dashboard");
    } else {
      toast({
        title: "Invalid Credentials",
        description: "Please check your email and password.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Hostel Hub</CardTitle>
          <CardDescription>Secure Enrollment Portal</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" className="flex items-center space-x-1">
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>Admin</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="student">
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div>
                  <Label htmlFor="student-email">Email Address</Label>
                  <Input
                    id="student-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your email to access the enrollment form
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Accessing..." : "Access Enrollment Form"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="admin">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />

                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In as Admin"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login; 