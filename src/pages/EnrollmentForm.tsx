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
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';

const VITE_RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const EnrollmentForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedStudentId, setGeneratedStudentId] = useState<string>("");
  const [existingStudent, setExistingStudent] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [colleges, setColleges] = useState<any[]>([]);
  const [hostels, setHostels] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    academicYears: [],
    admissionYears: [],
    branches: [],
    castes: [],
    hostelYears: [],
    roomTypes: [],
    installments: 2
  });
  const [isLoading, setIsLoading] = useState(true);

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
  });

  const navigate = useNavigate();

  // Remove filtering by collegeId for hostels
  const filteredHostels = formData.hostelType ? hostels.filter(hostel => hostel.type === formData.hostelType) : hostels;

  // Generate student ID when key fields change
  useEffect(() => {
    if (formData.hostelYear && formData.academicYear && formData.collegeId && formData.roomType && formData.hostelType) {
      const college = colleges.find(c => c._id === formData.collegeId);
      const roomType = settings.roomTypes.find(r => r.id === formData.roomType);
      
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
  }, [formData.hostelYear, formData.academicYear, formData.collegeId, formData.roomType, formData.hostelType, settings.roomTypes, colleges]);

  // Calculate fees when relevant fields change
  useEffect(() => {
    if (formData.hostelId && formData.roomType && formData.hostelYear && formData.caste && formData.studentType) {
      const hostelObj = hostels.find(h => h._id === formData.hostelId);
      const hostelName = hostelObj ? hostelObj.name : '';
      const fee = fees.find(f =>
        f.hostelYear === formData.hostelYear &&
        f.roomType === formData.roomType &&
        f.category === formData.caste &&
        f.hostelName === hostelName &&
        f.studentType === formData.studentType
      );
      if (fee) {
        const total = fee.amount + (fee.deposit || 0);
        setFeeDetails({
          baseFee: fee.amount,
          deposit: fee.deposit,
          totalFee: total,
        });
      } else {
        setFeeDetails({
          baseFee: 0,
          deposit: 0,
          totalFee: 0,
        });
      }
    }
  }, [formData.hostelId, formData.roomType, formData.hostelYear, formData.caste, formData.studentType, formData.email, fees, hostels]);

  useEffect(() => {
    if (user?.email) {
      // Fetch student record by email
      axios.get(`${BACKEND_URL}/api/auth/student/by-email?email=${encodeURIComponent(user.email)}`)
        .then(res => setExistingStudent(res.data))
        .catch(() => setExistingStudent(null));
    }
  }, [user?.email]);

  useEffect(() => {
    // Fetch all dropdown data
    const fetchDropdownData = async () => {
      try {
        console.log('Fetching dropdown data from:', BACKEND_URL);
        
        const [
          collegesRes,
          hostelsRes,
          settingsRes
        ] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/dropdowns/colleges`),
          axios.get(`${BACKEND_URL}/api/dropdowns/hostels`),
          axios.get(`${BACKEND_URL}/api/admin/public-settings`)
        ]);

        console.log('Dropdown data received:', {
          colleges: collegesRes.data.length,
          hostels: hostelsRes.data.length,
          settings: settingsRes.data
        });

        setColleges(collegesRes.data);
        setHostels(hostelsRes.data);
        setSettings(settingsRes.data);
        
        // Convert settings arrays to the format expected by dropdowns
        setYears(settingsRes.data.admissionYears?.map(name => ({ _id: name, name })) || []);
        setDepartments(settingsRes.data.branches?.map(name => ({ _id: name, name })) || []);
        setCategories(settingsRes.data.castes?.map(name => ({ _id: name, name })) || []);
        setRoomTypes(settingsRes.data.roomTypes?.map(name => ({ _id: name, name })) || []);
        
        // Set default fees since we can't access admin endpoints
        setFees([]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        // Set default values if API calls fail
        setSettings({
          academicYears: [],
          admissionYears: [],
          branches: [],
          castes: [],
          hostelYears: [],
          roomTypes: [],
          installments: 2
        });
        setIsLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  // Note: Fees are not fetched for students as they require admin authentication
  // Fee calculation will be handled on the payment page

  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user?.email]);

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

  // Update handleGoToPaymentPage to pass all required fields
  const handleGoToPaymentPage = () => {
    // Derive hostelName from hostelId and hostels array
    const hostelObj = hostels.find(h => h._id === formData.hostelId);
    const hostelName = hostelObj ? hostelObj.name : '';
    const college = colleges.find(c => c._id === formData.collegeId);
    navigate('/payment', {
      state: {
        ...formData,
        college: college?.name || '-',
        year: formData.academicYear || '-',
        department: formData.branch, // map branch to department
        contact: formData.contact,   // contactNo expected as contact
        hostelName, // derived from hostelId
        admissionYear: formData.yearOfAdmission, // map yearOfAdmission to admissionYear
        category: formData.caste, // map caste to category
        fee: {
          amount: feeDetails.baseFee,
          deposit: feeDetails.deposit,
        },
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      {existingStudent?.studentId && (
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4 text-base md:text-lg font-bold text-center">
          Your Student ID: {existingStudent.studentId}
        </div>
      )}
      <Card className="shadow-lg">
        <CardHeader className="text-center px-4 md:px-6">
          <CardTitle className="text-xl md:text-2xl font-bold flex items-center justify-center space-x-2">
            <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />
            <span>Hostel Enrollment Form</span>
          </CardTitle>
          <CardDescription className="text-sm md:text-base">Please fill in all the required information for hostel enrollment</CardDescription>
        </CardHeader>

        <CardContent className="px-4 md:px-6">
          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Loading form data...
            </div>
          )}
          

          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-semibold flex items-center space-x-2">
                <User className="w-4 h-4 md:w-5 md:h-5" />
                <span>Personal Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
                    readOnly={!!user?.email}
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
              <h3 className="text-base md:text-lg font-semibold flex items-center space-x-2">
                <Building className="w-4 h-4 md:w-5 md:h-5" />
                <span>Academic Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label htmlFor="college">College Name *</Label>
                  <Select value={formData.collegeId} onValueChange={(value) => setFormData({...formData, collegeId: value, hostelId: ""})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select college" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map(college => (
                        <SelectItem key={college._id} value={college._id}>{college.name}</SelectItem>
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
                      {years.map(year => (
                        <SelectItem key={year._id} value={year.name}>{year.name}</SelectItem>
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
                      {years.map(year => (
                        <SelectItem key={year._id} value={year.name}>{year.name}</SelectItem>
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
                      {departments.map(dept => (
                        <SelectItem key={dept._id} value={dept.name}>{dept.name}</SelectItem>
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
                      {categories.map(category => (
                        <SelectItem key={category._id} value={category.name}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Hostel Information */}
            <div className="space-y-4">
              <h3 className="text-base md:text-lg font-semibold flex items-center space-x-2">
                <Bed className="w-4 h-4 md:w-5 md:h-5" />
                <span>Hostel Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
                  <Select value={formData.hostelId} onValueChange={(value) => setFormData({...formData, hostelId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hostel" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredHostels.map(hostel => (
                        <SelectItem key={hostel._id} value={hostel._id}>{hostel.name}</SelectItem>
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
                      {roomTypes.map(roomType => (
                        <SelectItem key={roomType._id} value={roomType.name}>{roomType.name}</SelectItem>
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
                      {years.map(year => (
                        <SelectItem key={year._id} value={year.name}>{year.name}</SelectItem>
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
                <div className="text-center p-3 md:p-4 bg-muted rounded-lg">
                  <Label className="text-xs md:text-sm font-medium">Generated Student ID</Label>
                  <div className="text-lg md:text-2xl font-bold mt-1 break-all">{generatedStudentId}</div>
                </div>
              </>
            )}

            {/* Fee Details */}
            {feeDetails.totalFee > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-semibold">Fee Details</h3>
                  <div className="bg-muted p-3 md:p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm md:text-base">
                      <span>Base Fee:</span>
                      <span className="font-semibold">{formatCurrency(feeDetails.baseFee)}</span>
                    </div>
                    {feeDetails.deposit > 0 && (
                      <div className="flex justify-between text-sm md:text-base">
                        <span>Deposit:</span>
                        <span className="font-semibold">{formatCurrency(feeDetails.deposit)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-base md:text-lg font-bold">
                      <span>Total Fee:</span>
                      <span className="text-accent-foreground">{formatCurrency(feeDetails.totalFee)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button
              type="button"
              className="w-full py-4 md:py-6 text-base md:text-lg"
              onClick={handleGoToPaymentPage}
              disabled={isPaying || feeDetails.totalFee <= 0}
            >
              {isPaying ? "Processing..." : "Proceed to Payment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrollmentForm; 