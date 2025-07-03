import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, Building, Bed, DollarSign, Settings, FileText } from "lucide-react";
import CollegeManagement from "./CollegeManagement";
import HostelManagement from "./HostelManagement";
import FeeManagement from "./FeeManagement";
import StudentsView from "./StudentsView";
import AdminSettings from "./AdminSettings";

const AdminDashboard = () => {
  const [stats] = useState({
    totalStudents: 245,
    totalColleges: 3,
    totalHostels: 8,
    totalRevenue: 2075000
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-hostel-primary">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage hostel enrollments and configurations</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colleges</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalColleges}</div>
            <p className="text-xs text-muted-foreground">Active colleges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hostels</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHostels}</div>
            <p className="text-xs text-muted-foreground">Across all colleges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(stats.totalRevenue / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">This academic year</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Interface */}
      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="students" className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>Students</span>
          </TabsTrigger>
          <TabsTrigger value="colleges" className="flex items-center space-x-1">
            <Building className="w-4 h-4" />
            <span>Colleges</span>
          </TabsTrigger>
          <TabsTrigger value="hostels" className="flex items-center space-x-1">
            <Bed className="w-4 h-4" />
            <span>Hostels</span>
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex items-center space-x-1">
            <DollarSign className="w-4 h-4" />
            <span>Fees</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-1">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <StudentsView />
        </TabsContent>

        <TabsContent value="colleges">
          <CollegeManagement />
        </TabsContent>

        <TabsContent value="hostels">
          <HostelManagement />
        </TabsContent>

        <TabsContent value="fees">
          <FeeManagement />
        </TabsContent>

        <TabsContent value="settings">
          <AdminSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;