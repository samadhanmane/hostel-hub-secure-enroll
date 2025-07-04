import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [newDepartment, setNewDepartment] = useState({ name: "" });
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  // Fetch departments from backend
  const fetchDepartments = async () => {
    try {
      const res = await axios.get("/api/dropdowns/departments");
      setDepartments(res.data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch departments.", variant: "destructive" });
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartment.name) return;
    try {
      await axios.post("/api/admin/department", { name: newDepartment.name });
      toast({ title: "Department Added", description: `${newDepartment.name} has been added successfully.` });
      setNewDepartment({ name: "" });
      setIsAdding(false);
      fetchDepartments();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to add department.", variant: "destructive" });
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await axios.delete(`/api/admin/department/${id}`);
      toast({ title: "Department Removed", description: "Department has been removed successfully." });
      fetchDepartments();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to delete department.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Department Management</span>
            <Button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-hostel-primary hover:bg-hostel-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </CardTitle>
          <CardDescription>
            Manage departments that are part of the hostel system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAdding && (
            <form onSubmit={handleAddDepartment} className="mb-6 p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department-name">Department Name</Label>
                  <Input
                    id="department-name"
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                    placeholder="Enter department name"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-hostel-success hover:bg-hostel-success/90">
                  Add Department
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department Name</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department._id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell>{new Date(department.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteDepartment(department._id)}
                          className="text-hostel-danger hover:text-hostel-danger"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentManagement; 