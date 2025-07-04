import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Student } from "@/types";
import { Search, Download, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import axios from "axios";

const StudentsView = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    // Load students from backend
    axios.get('/api/admin/users').then(res => {
      setStudents(res.data);
      setFilteredStudents(res.data);
    });
  }, []);

  useEffect(() => {
    // Filter students based on search term
    const filtered = students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  const handleView = async (student: any) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
    // Fetch payments for this student
    const res = await axios.get(`/api/admin/payments?studentId=${student.studentId}`);
    setPayments(res.data);
  };

  const handleDelete = async (student: any) => {
    if (!window.confirm(`Delete student ${student.name} (${student.studentId})?`)) return;
    try {
      await axios.delete(`/api/admin/users/${student.studentId}`);
      setStudents((prev) => prev.filter((s) => s.studentId !== student.studentId));
      setFilteredStudents((prev) => prev.filter((s) => s.studentId !== student.studentId));
    } catch (err) {
      alert("Failed to delete student.");
    }
  };

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
                <TableHead>Hostel Name</TableHead>
                <TableHead>Room Type</TableHead>
                <TableHead>Student Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    {students.length === 0 ? "No students enrolled yet" : "No students found matching your search"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell className="font-mono text-sm">{student.studentId}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.college}</TableCell>
                    <TableCell>{student.year}</TableCell>
                    <TableCell>
                      <Badge className={getHostelTypeColor(student.hostelType)}>
                        {student.hostelType}
                      </Badge>
                    </TableCell>
                    <TableCell>{student.hostelName}</TableCell>
                    <TableCell>{student.roomType}</TableCell>
                    <TableCell>
                      <Badge className={getStudentTypeColor(student.studentType)}>
                        {student.studentType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleView(student)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(student)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
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
      {/* View Payments Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Student Payments</DialogTitle>
            <DialogDescription>
              Fees paid by {selectedStudent?.name} ({selectedStudent?.studentId})
            </DialogDescription>
          </DialogHeader>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No payments found for this student.</div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment, idx) => (
                <div key={payment._id} className="flex items-center justify-between border rounded p-3">
                  <div>
                    <div className="font-medium">Amount: ₹{payment.amount}</div>
                    <div className="text-xs text-muted-foreground">Date: {new Date(payment.paymentDate).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Status: {payment.status}</div>
                  </div>
                  {payment.receiptUrl && (
                    <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default StudentsView;