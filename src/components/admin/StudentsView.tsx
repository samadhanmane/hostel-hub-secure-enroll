import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Student } from "@/types";
import { Search, Download, Eye, Trash2, FileSpreadsheet, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import api from "@/utils/api";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const StudentsView = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Load students from backend
    api.get('/api/admin/users')
      .then(res => {
        setStudents(res.data);
        setFilteredStudents(res.data);
      })
      .catch(error => {
        console.error('Failed to fetch students:', error);
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
    try {
      const res = await api.get(`/api/admin/payments?studentId=${student.studentId}`);
      setPayments(res.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
  };

  const handleDelete = async (student: any) => {
    if (!window.confirm(`Delete student ${student.name} (${student.studentId})?`)) return;

    try {
      await api.delete(`/api/admin/users/${student.studentId}`);
      setStudents((prev) => prev.filter((s) => s.studentId !== student.studentId));
      setFilteredStudents((prev) => prev.filter((s) => s.studentId !== student.studentId));
    } catch (err) {
      console.error('Failed to delete student:', err);
      alert("Failed to delete student.");
    }
  };

  const handleExportCSV = async (type: 'students' | 'payments') => {
    setIsExporting(true);
    try {
      const endpoint = type === 'students' ? '/export-students' : '/export-payment-history';
      const filename = type === 'students' ? 'students_data' : 'payment_history';
      
      console.log('Exporting:', type, 'to endpoint:', `${BACKEND_URL}/api/admin${endpoint}`);
      console.log('Token:', localStorage.getItem('token'));
      
      const response = await api.get(`/api/admin${endpoint}`, {
        responseType: 'blob'
      });
      
      console.log('Export response received:', response.status);
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('CSV file downloaded successfully');
    } catch (error) {
      console.error('Export failed:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to export CSV file';
      
      // Try to get the actual error message from the server
      if (error.response?.data) {
        try {
          // If it's a blob, try to read it as text
          if (error.response.data instanceof Blob) {
            const text = await error.response.data.text();
            const jsonData = JSON.parse(text);
            errorMessage = jsonData.message || jsonData.error || 'Server error';
          } else {
            errorMessage = error.response.data.message || error.response.data.error || 'Server error';
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = 'Server error occurred while generating CSV. Please try again.';
        }
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred while generating CSV. Please try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsExporting(false);
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={isExporting}
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export Data'}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportCSV('students')}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export Students Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportCSV('payments')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Payment History
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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