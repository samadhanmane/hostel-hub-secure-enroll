import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Student } from "@/types";
import { Search, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const StudentsView = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  useEffect(() => {
    // Load students from localStorage
    const savedStudents = JSON.parse(localStorage.getItem('hostel_students') || '[]');
    setStudents(savedStudents);
    setFilteredStudents(savedStudents);
  }, []);

  useEffect(() => {
    // Filter students based on search term
    const filtered = students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  const getStudentTypeColor = (type: string) => {
    return type === 'new' ? 'bg-hostel-success text-white' : 'bg-hostel-primary-light text-hostel-primary';
  };

  const getHostelTypeColor = (type: string) => {
    return type === 'boys' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Enrolled Students</span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          View and manage all enrolled students
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <Label htmlFor="search">Search Students</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name, email, or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Hostel</TableHead>
                <TableHead>Room Type</TableHead>
                <TableHead>Student Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {students.length === 0 ? "No students enrolled yet" : "No students found matching your search"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono text-sm">{student.id}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.collegeId}</TableCell>
                    <TableCell>{student.academicYear}</TableCell>
                    <TableCell>
                      <Badge className={getHostelTypeColor(student.hostelType)}>
                        {student.hostelType}
                      </Badge>
                    </TableCell>
                    <TableCell>{student.roomType}</TableCell>
                    <TableCell>
                      <Badge className={getStudentTypeColor(student.studentType)}>
                        {student.studentType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredStudents.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentsView;