import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { generateStudentId } from "@/utils/studentIdGenerator";
import { calculateFee, formatCurrency } from "@/utils/feeCalculator";
import { Student } from "@/types";
import { Calendar, User, Mail, Phone, GraduationCap, Building, Bed } from "lucide-react";

// Mock data - in real app, this would come from API/database
const mockColleges = [
  { id: '1', name: 'MIT Academy of Engineering', code: 'MITAOE' },
  { id: '2', name: 'Pune Institute of Technology', code: 'PIT' },
  { id: '3', name: 'Maharashtra Academy', code: 'MA' }
];

const mockHostels = [
  { id: '1', name: 'MITAOE Boys Hostel-A', type: 'boys' as const, collegeId: '1' },
  { id: '2', name: 'MITAOE Girls Hostel-A', type: 'girls' as const, collegeId: '1' },
  { id: '3', name: 'PIT Boys Hostel-B', type: 'boys' as const, collegeId: '2' },
];

const academicYears = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
const admissionYears = ['2021', '2022', '2023', '2024', '2025'];
const branches = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'];
const castes = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const hostelYears = ['2025-2026', '2026-2027', '2027-2028'];
const roomTypes = [
  { id: '2-sharing', name: '2 Person Sharing', capacity: 2 },
  { id: '3-sharing', name: '3 Person Sharing', capacity: 3 }
];

const EnrollmentForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedStudentId, setGeneratedStudentId] = useState<string>("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    contact: "",
    collegeId: "",
    yearOfAdmission: "",
    academicYear: "",
    branch: "",
    hostelType: undefined as 'boys' | 'girls' | undefined,
    hostelId: "",
    roomType: "",
    studentType: undefined as 'new' | 'existing' | undefined,
    caste: "",
    hostelYear: "",
  });

  const [feeDetails, setFeeDetails] = useState({
    baseFee: 0,
    deposit: 0,
    totalFee: 0,
    canSplitPayment: false,
    installmentAmount: 0,
    installments: undefined as number | undefined
  });

  // Filter hostels based on selected college and hostel type
  const filteredHostels = mockHostels.filter(
    hostel => hostel.collegeId === formData.collegeId && hostel.type === formData.hostelType
  );

  // Generate student ID when key fields change
  useEffect(() => {
    if (formData.hostelYear && formData.academicYear && formData.collegeId && formData.roomType && formData.hostelType) {
      const college = mockColleges.find(c => c.id === formData.collegeId);
      const roomType = roomTypes.find(r => r.id === formData.roomType);
      
      if (college && roomType) {
        const studentId = generateStudentId(
          formData.hostelYear,
          formData.academicYear,
          college.name,
          roomType.capacity,
          formData.hostelType
        );
        setGeneratedStudentId(studentId);
      }
    }
  }, [formData.hostelYear, formData.academicYear, formData.collegeId, formData.roomType, formData.hostelType]);

  // Calculate fees when relevant fields change
  useEffect(() => {
    if (formData.hostelId && formData.roomType && formData.hostelYear && formData.caste && formData.studentType) {
      const calculation = calculateFee(
        formData.hostelId,
        formData.roomType,
        formData.hostelYear,
        formData.caste,
        formData.studentType,
        [], // Empty fee structures for demo
        { id: '1', studentEmail: formData.email, isActive: true, installments: 2, createdAt: new Date() }
      );
      
      setFeeDetails({
        baseFee: calculation.baseFee,
        deposit: calculation.deposit,
        totalFee: calculation.totalFee,
        canSplitPayment: calculation.canSplitPayment,
        installmentAmount: calculation.installmentAmount || 0,
        installments: calculation.installments
      });
    }
  }, [formData.hostelId, formData.roomType, formData.hostelYear, formData.caste, formData.studentType, formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.contact || !formData.collegeId || 
          !formData.yearOfAdmission || !formData.academicYear || !formData.branch || 
          !formData.hostelType || !formData.hostelId || !formData.roomType || 
          !formData.studentType || !formData.caste || !formData.hostelYear) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create student record
      const student: Student = {
        id: generatedStudentId,
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
        collegeId: formData.collegeId,
        yearOfAdmission: formData.yearOfAdmission,
        academicYear: formData.academicYear,
        branch: formData.branch,
        hostelType: formData.hostelType,
        hostelId: formData.hostelId,
        roomType: formData.roomType,
        studentType: formData.studentType,
        caste: formData.caste,
        hostelYear: formData.hostelYear,
        createdAt: new Date()
      };

      // Save to localStorage for demo
      const existingStudents = JSON.parse(localStorage.getItem('hostel_students') || '[]');
      existingStudents.push(student);
      localStorage.setItem('hostel_students', JSON.stringify(existingStudents));

      toast({
        title: "Enrollment Successful!",
        description: `Your Student ID is: ${generatedStudentId}`,
      });

      // Reset form
      setFormData({
        name: "",
        email: user?.email || "",
        contact: "",
        collegeId: "",
        yearOfAdmission: "",
        academicYear: "",
        branch: "",
        hostelType: undefined,
        hostelId: "",
        roomType: "",
        studentType: undefined,
        caste: "",
        hostelYear: "",
      });

    } catch (error) {
      toast({
        title: "Enrollment Failed",
        description: "An error occurred during enrollment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center space-x-2">
            <GraduationCap className="w-6 h-6" />
            <span>Hostel Enrollment Form</span>
          </CardTitle>
          <CardDescription>Please fill in all the required information for hostel enrollment</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Student Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact">Contact Number *</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    placeholder="Enter contact number"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="studentType">Student Type *</Label>
                  <Select value={formData.studentType} onValueChange={(value: 'new' | 'existing') => setFormData({...formData, studentType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New Student</SelectItem>
                      <SelectItem value="existing">Existing Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Academic Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="college">College Name *</Label>
                  <Select value={formData.collegeId} onValueChange={(value) => setFormData({...formData, collegeId: value, hostelId: ""})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select college" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockColleges.map(college => (
                        <SelectItem key={college.id} value={college.id}>{college.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="yearOfAdmission">Year of Admission *</Label>
                  <Select value={formData.yearOfAdmission} onValueChange={(value) => setFormData({...formData, yearOfAdmission: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select admission year" />
                    </SelectTrigger>
                    <SelectContent>
                      {admissionYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="academicYear">Academic Year *</Label>
                  <Select value={formData.academicYear} onValueChange={(value) => setFormData({...formData, academicYear: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="branch">Branch/Department *</Label>
                  <Select value={formData.branch} onValueChange={(value) => setFormData({...formData, branch: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map(branch => (
                        <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="caste">Caste/Category *</Label>
                  <Select value={formData.caste} onValueChange={(value) => setFormData({...formData, caste: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {castes.map(caste => (
                        <SelectItem key={caste} value={caste}>{caste}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Hostel Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Bed className="w-5 h-5" />
                <span>Hostel Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hostelType">Hostel Type *</Label>
                  <Select value={formData.hostelType} onValueChange={(value: 'boys' | 'girls') => setFormData({...formData, hostelType: value, hostelId: ""})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hostel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boys">Boys Hostel</SelectItem>
                      <SelectItem value="girls">Girls Hostel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="hostel">Hostel Name *</Label>
                  <Select value={formData.hostelId} onValueChange={(value) => setFormData({...formData, hostelId: value})} disabled={!formData.collegeId || !formData.hostelType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hostel" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredHostels.map(hostel => (
                        <SelectItem key={hostel.id} value={hostel.id}>{hostel.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="roomType">Room Type *</Label>
                  <Select value={formData.roomType} onValueChange={(value) => setFormData({...formData, roomType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map(room => (
                        <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="hostelYear">Hostel Year *</Label>
                  <Select value={formData.hostelYear} onValueChange={(value) => setFormData({...formData, hostelYear: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hostel year" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostelYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Generated Student ID */}
            {generatedStudentId && (
              <>
                <Separator />
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-medium">Generated Student ID</Label>
                  <div className="text-2xl font-bold mt-1">{generatedStudentId}</div>
                </div>
              </>
            )}

            {/* Fee Details */}
            {feeDetails.totalFee > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Fee Details</h3>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Base Fee:</span>
                      <span className="font-semibold">{formatCurrency(feeDetails.baseFee)}</span>
                    </div>
                    {feeDetails.deposit > 0 && (
                      <div className="flex justify-between">
                        <span>Deposit:</span>
                        <span className="font-semibold">{formatCurrency(feeDetails.deposit)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Fee:</span>
                      <span className="text-accent-foreground">{formatCurrency(feeDetails.totalFee)}</span>
                    </div>
                    {feeDetails.canSplitPayment && (
                      <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                        <Badge variant="outline" className="mb-2">Split Payment Available</Badge>
                        <div className="text-sm">
                          <div>Installment Amount: <span className="font-semibold">{formatCurrency(feeDetails.installmentAmount)}</span></div>
                          <div className="text-muted-foreground">Pay in 2 installments (4 months gap)</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Button 
              type="submit" 
              className="w-full py-6 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing Enrollment..." : "Proceed to Payment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrollmentForm;