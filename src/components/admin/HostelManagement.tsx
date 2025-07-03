import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Hostel } from "@/types";

const HostelManagement = () => {
  const [hostels, setHostels] = useState<Hostel[]>([
    { id: '1', name: 'MITAOE Boys Hostel-A', type: 'boys', collegeId: '1', createdAt: new Date() },
    { id: '2', name: 'MITAOE Girls Hostel-A', type: 'girls', collegeId: '1', createdAt: new Date() },
    { id: '3', name: 'PIT Boys Hostel-B', type: 'boys', collegeId: '2', createdAt: new Date() },
  ]);
  
  const [newHostel, setNewHostel] = useState({ 
    name: '', 
    type: '' as 'boys' | 'girls' | '', 
    collegeId: '' 
  });
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const colleges = [
    { id: '1', name: 'MIT Academy of Engineering' },
    { id: '2', name: 'Pune Institute of Technology' },
    { id: '3', name: 'Maharashtra Academy' }
  ];

  const handleAddHostel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHostel.name || !newHostel.type || !newHostel.collegeId) return;

    const hostel: Hostel = {
      id: Date.now().toString(),
      name: newHostel.name,
      type: newHostel.type as 'boys' | 'girls',
      collegeId: newHostel.collegeId,
      createdAt: new Date()
    };

    setHostels([...hostels, hostel]);
    setNewHostel({ name: '', type: '', collegeId: '' });
    setIsAdding(false);
    
    toast({
      title: "Hostel Added",
      description: `${newHostel.name} has been added successfully.`,
    });
  };

  const handleDeleteHostel = (id: string) => {
    setHostels(hostels.filter(hostel => hostel.id !== id));
    toast({
      title: "Hostel Removed",
      description: "Hostel has been removed successfully.",
    });
  };

  const getCollegeName = (collegeId: string) => {
    return colleges.find(c => c.id === collegeId)?.name || 'Unknown';
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
            Manage hostels across all colleges
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
                    onChange={(e) => setNewHostel({...newHostel, name: e.target.value})}
                    placeholder="Enter hostel name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hostel-type">Hostel Type</Label>
                  <Select value={newHostel.type} onValueChange={(value: 'boys' | 'girls') => setNewHostel({...newHostel, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boys">Boys Hostel</SelectItem>
                      <SelectItem value="girls">Girls Hostel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="college">College</Label>
                  <Select value={newHostel.collegeId} onValueChange={(value) => setNewHostel({...newHostel, collegeId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select college" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map(college => (
                        <SelectItem key={college.id} value={college.id}>{college.name}</SelectItem>
                      ))}
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
                  <TableHead>College</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hostels.map((hostel) => (
                  <TableRow key={hostel.id}>
                    <TableCell className="font-medium">{hostel.name}</TableCell>
                    <TableCell>
                      <Badge className={getHostelTypeColor(hostel.type)}>
                        {hostel.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{getCollegeName(hostel.collegeId)}</TableCell>
                    <TableCell>{hostel.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteHostel(hostel.id)}
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