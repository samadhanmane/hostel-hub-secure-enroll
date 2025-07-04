import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Hostel } from "@/types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const HostelManagement = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [newHostel, setNewHostel] = useState({ name: "", type: "boys" });
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  // Fetch hostels and colleges from backend
  const fetchHostels = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/dropdowns/hostels`);
      setHostels(res.data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch hostels.", variant: "destructive" });
    }
  };

  useEffect(() => { fetchHostels(); }, []);

  const handleAddHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHostel.name || !newHostel.type) return;
    try {
      await axios.post(`${BACKEND_URL}/api/admin/hostel`, { name: newHostel.name, type: newHostel.type });
      toast({ title: "Hostel Added", description: `${newHostel.name} has been added successfully.` });
      setNewHostel({ name: "", type: "boys" });
      setIsAdding(false);
      fetchHostels();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to add hostel.", variant: "destructive" });
    }
  };

  const handleDeleteHostel = async (id: string) => {
    if (!window.confirm("Delete this hostel?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/hostel/${id}`);
      toast({ title: "Hostel Removed", description: "Hostel has been removed successfully." });
      fetchHostels();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to delete hostel.", variant: "destructive" });
    }
  };

  const getHostelTypeColor = (type: string) => {
    return type === 'boys' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Hostel Management</span>
            <Button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-hostel-primary hover:bg-hostel-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Hostel
            </Button>
          </CardTitle>
          <CardDescription>
            Manage hostels that are part of the hostel system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAdding && (
            <form onSubmit={handleAddHostel} className="mb-6 p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="hostel-name">Hostel Name</Label>
                  <Input
                    id="hostel-name"
                    value={newHostel.name}
                    onChange={(e) => setNewHostel({ ...newHostel, name: e.target.value })}
                    placeholder="Enter hostel name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hostel-type">Hostel Type</Label>
                  <Select value={newHostel.type} onValueChange={(value: 'boys' | 'girls') => setNewHostel({ ...newHostel, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boys">Boys Hostel</SelectItem>
                      <SelectItem value="girls">Girls Hostel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-hostel-success hover:bg-hostel-success/90">
                  Add Hostel
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
                  <TableHead>Hostel Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hostels.map((hostel) => (
                  <TableRow key={hostel._id}>
                    <TableCell className="font-medium">{hostel.name}</TableCell>
                    <TableCell>
                      <Badge className={getHostelTypeColor(hostel.type)}>
                        {hostel.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{hostel.createdAt ? new Date(hostel.createdAt).toLocaleDateString() : ''}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteHostel(hostel._id)}
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

export default HostelManagement;