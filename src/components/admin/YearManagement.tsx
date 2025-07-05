import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const YearManagement = () => {
  const [years, setYears] = useState<any[]>([]);
  const [newYear, setNewYear] = useState({ name: "" });
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  // Fetch years from backend
  const fetchYears = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/dropdowns/years`);
      setYears(res.data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch years.", variant: "destructive" });
    }
  };

  useEffect(() => { fetchYears(); }, []);

  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYear.name) return;
    try {
      await axios.post(`${BACKEND_URL}/api/admin/year`, { name: newYear.name });
      toast({ title: "Year Added", description: `${newYear.name} has been added successfully.` });
      setNewYear({ name: "" });
      setIsAdding(false);
      fetchYears();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to add year.", variant: "destructive" });
    }
  };

  const handleDeleteYear = async (id: string) => {
    if (!window.confirm("Delete this year?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/year/${id}`);
      toast({ title: "Year Removed", description: "Year has been removed successfully." });
      fetchYears();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to delete year.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Year Management</span>
            <Button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-hostel-primary hover:bg-hostel-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Year
            </Button>
          </CardTitle>
          <CardDescription>
            Manage academic years for the hostel system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAdding && (
            <form onSubmit={handleAddYear} className="mb-6 p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year-name">Year Name</Label>
                  <Input
                    id="year-name"
                    value={newYear.name}
                    onChange={(e) => setNewYear({ ...newYear, name: e.target.value })}
                    placeholder="Enter year name (e.g., 2024-25)"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-hostel-success hover:bg-hostel-success/90">
                  Add Year
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
                  <TableHead>Year Name</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {years.map((year) => (
                  <TableRow key={year._id}>
                    <TableCell className="font-medium">{year.name}</TableCell>
                    <TableCell>{new Date(year.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteYear(year._id)}
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

export default YearManagement; 