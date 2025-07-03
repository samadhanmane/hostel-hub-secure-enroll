import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/feeCalculator";
import { Separator } from "@/components/ui/separator";

interface FeeStructure {
  id: string;
  roomType: string;
  hostelYear: string;
  caste: string;
  newStudentFee: number;
  existingStudentFee: number;
  deposit: number;
}

interface SplitPaymentAccess {
  id: string;
  studentEmail: string;
  installments: number;
  isActive: boolean;
}

const FeeManagement = () => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([
    {
      id: '1',
      roomType: '2-sharing',
      hostelYear: '2025-2026',
      caste: 'General',
      newStudentFee: 85000,
      existingStudentFee: 85000,
      deposit: 10000
    },
    {
      id: '2',
      roomType: '3-sharing',
      hostelYear: '2025-2026',
      caste: 'General',
      newStudentFee: 95000,
      existingStudentFee: 95000,
      deposit: 10000
    }
  ]);

  const [splitAccess, setSplitAccess] = useState<SplitPaymentAccess[]>([]);
  const [newFee, setNewFee] = useState({
    roomType: '',
    hostelYear: '',
    caste: '',
    newStudentFee: '',
    existingStudentFee: '',
    deposit: ''
  });
  const [newSplitAccess, setNewSplitAccess] = useState({
    studentEmail: '',
    installments: '2'
  });
  const [isAddingFee, setIsAddingFee] = useState(false);
  const [isAddingSplit, setIsAddingSplit] = useState(false);
  const { toast } = useToast();

  const roomTypes = ['2-sharing', '3-sharing'];
  const hostelYears = ['2025-2026', '2026-2027', '2027-2028'];
  const castes = ['General', 'OBC', 'SC', 'ST', 'EWS'];

  const handleAddFeeStructure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFee.roomType || !newFee.hostelYear || !newFee.caste) return;

    const fee: FeeStructure = {
      id: Date.now().toString(),
      roomType: newFee.roomType,
      hostelYear: newFee.hostelYear,
      caste: newFee.caste,
      newStudentFee: parseInt(newFee.newStudentFee),
      existingStudentFee: parseInt(newFee.existingStudentFee),
      deposit: parseInt(newFee.deposit)
    };

    setFeeStructures([...feeStructures, fee]);
    setNewFee({
      roomType: '',
      hostelYear: '',
      caste: '',
      newStudentFee: '',
      existingStudentFee: '',
      deposit: ''
    });
    setIsAddingFee(false);
    
    toast({
      title: "Fee Structure Added",
      description: "New fee structure has been added successfully.",
    });
  };

  const handleAddSplitAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSplitAccess.studentEmail) return;

    const access: SplitPaymentAccess = {
      id: Date.now().toString(),
      studentEmail: newSplitAccess.studentEmail,
      installments: parseInt(newSplitAccess.installments),
      isActive: true
    };

    setSplitAccess([...splitAccess, access]);
    setNewSplitAccess({
      studentEmail: '',
      installments: '2'
    });
    setIsAddingSplit(false);
    
    toast({
      title: "Split Payment Access Granted",
      description: `${newSplitAccess.studentEmail} can now pay in installments.`,
    });
  };

  const toggleSplitAccess = (id: string) => {
    setSplitAccess(splitAccess.map(access => 
      access.id === id ? { ...access, isActive: !access.isActive } : access
    ));
  };

  return (
    <div className="space-y-6">
      {/* Fee Structures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Fee Structure Management</span>
            <Button 
              onClick={() => setIsAddingFee(!isAddingFee)}
              className="bg-hostel-primary hover:bg-hostel-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Fee Structure
            </Button>
          </CardTitle>
          <CardDescription>
            Configure fees for different room types, years, and categories
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isAddingFee && (
            <form onSubmit={handleAddFeeStructure} className="mb-6 p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="room-type">Room Type</Label>
                  <Select value={newFee.roomType} onValueChange={(value) => setNewFee({...newFee, roomType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hostel-year">Hostel Year</Label>
                  <Select value={newFee.hostelYear} onValueChange={(value) => setNewFee({...newFee, hostelYear: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostelYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="caste">Category</Label>
                  <Select value={newFee.caste} onValueChange={(value) => setNewFee({...newFee, caste: value})}>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="new-fee">New Student Fee</Label>
                  <Input
                    id="new-fee"
                    type="number"
                    value={newFee.newStudentFee}
                    onChange={(e) => setNewFee({...newFee, newStudentFee: e.target.value})}
                    placeholder="Enter fee amount"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="existing-fee">Existing Student Fee</Label>
                  <Input
                    id="existing-fee"
                    type="number"
                    value={newFee.existingStudentFee}
                    onChange={(e) => setNewFee({...newFee, existingStudentFee: e.target.value})}
                    placeholder="Enter fee amount"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deposit">Deposit Amount</Label>
                  <Input
                    id="deposit"
                    type="number"
                    value={newFee.deposit}
                    onChange={(e) => setNewFee({...newFee, deposit: e.target.value})}
                    placeholder="Enter deposit amount"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-hostel-success hover:bg-hostel-success/90">
                  Add Fee Structure
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddingFee(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Hostel Year</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>New Student Fee</TableHead>
                  <TableHead>Existing Student Fee</TableHead>
                  <TableHead>Deposit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeStructures.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{fee.roomType}</TableCell>
                    <TableCell>{fee.hostelYear}</TableCell>
                    <TableCell>{fee.caste}</TableCell>
                    <TableCell>{formatCurrency(fee.newStudentFee)}</TableCell>
                    <TableCell>{formatCurrency(fee.existingStudentFee)}</TableCell>
                    <TableCell>{formatCurrency(fee.deposit)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-hostel-danger hover:text-hostel-danger">
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

      {/* Split Payment Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Split Payment Access</span>
            <Button 
              onClick={() => setIsAddingSplit(!isAddingSplit)}
              className="bg-hostel-success hover:bg-hostel-success/90"
            >
              <Users className="w-4 h-4 mr-2" />
              Grant Access
            </Button>
          </CardTitle>
          <CardDescription>
            Manage which students can pay fees in installments
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isAddingSplit && (
            <form onSubmit={handleAddSplitAccess} className="mb-6 p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="student-email">Student Email</Label>
                  <Input
                    id="student-email"
                    type="email"
                    value={newSplitAccess.studentEmail}
                    onChange={(e) => setNewSplitAccess({...newSplitAccess, studentEmail: e.target.value})}
                    placeholder="Enter student email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="installments">Number of Installments</Label>
                  <Select value={newSplitAccess.installments} onValueChange={(value) => setNewSplitAccess({...newSplitAccess, installments: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select installments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Installments</SelectItem>
                      <SelectItem value="3">3 Installments</SelectItem>
                      <SelectItem value="4">4 Installments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-hostel-success hover:bg-hostel-success/90">
                  Grant Access
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddingSplit(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {splitAccess.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Email</TableHead>
                    <TableHead>Installments</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {splitAccess.map((access) => (
                    <TableRow key={access.id}>
                      <TableCell className="font-medium">{access.studentEmail}</TableCell>
                      <TableCell>{access.installments}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          access.isActive ? 'bg-hostel-success text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {access.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleSplitAccess(access.id)}
                        >
                          {access.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No split payment access granted yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeeManagement;