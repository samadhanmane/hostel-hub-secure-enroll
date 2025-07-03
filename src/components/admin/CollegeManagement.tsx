import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { College } from "@/types";

const CollegeManagement = () => {
  const [colleges, setColleges] = useState<College[]>([
    { id: '1', name: 'MIT Academy of Engineering', code: 'MITAOE', createdAt: new Date() },
    { id: '2', name: 'Pune Institute of Technology', code: 'PIT', createdAt: new Date() },
    { id: '3', name: 'Maharashtra Academy', code: 'MA', createdAt: new Date() }
  ]);
  
  const [newCollege, setNewCollege] = useState({ name: '', code: '' });
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleAddCollege = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollege.name || !newCollege.code) return;

    const college: College = {
      id: Date.now().toString(),
      name: newCollege.name,
      code: newCollege.code,
      createdAt: new Date()
    };

    setColleges([...colleges, college]);
    setNewCollege({ name: '', code: '' });
    setIsAdding(false);
    
    toast({
      title: "College Added",
      description: `${newCollege.name} has been added successfully.`,
    });
  };

  const handleDeleteCollege = (id: string) => {
    setColleges(colleges.filter(college => college.id !== id));
    toast({
      title: "College Removed",
      description: "College has been removed successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>College Management</span>
            <Button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-hostel-primary hover:bg-hostel-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add College
            </Button>
          </CardTitle>
          <CardDescription>
            Manage colleges that are part of the hostel system
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isAdding && (
            <form onSubmit={handleAddCollege} className="mb-6 p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="college-name">College Name</Label>
                  <Input
                    id="college-name"
                    value={newCollege.name}
                    onChange={(e) => setNewCollege({...newCollege, name: e.target.value})}
                    placeholder="Enter college name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="college-code">College Code</Label>
                  <Input
                    id="college-code"
                    value={newCollege.code}
                    onChange={(e) => setNewCollege({...newCollege, code: e.target.value.toUpperCase()})}
                    placeholder="Enter college code (e.g., MITAOE)"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-hostel-success hover:bg-hostel-success/90">
                  Add College
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
                  <TableHead>College Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colleges.map((college) => (
                  <TableRow key={college.id}>
                    <TableCell className="font-medium">{college.name}</TableCell>
                    <TableCell className="font-mono">{college.code}</TableCell>
                    <TableCell>{college.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteCollege(college.id)}
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

export default CollegeManagement;