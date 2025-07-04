import { useState, useEffect } from "react";
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
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface FeeStructure {
  id: string;
  hostelId: string;
  roomType: string;
  hostelYear: string;
  caste: string;
  newStudentFee: number;
  existingStudentFee: number;
  deposit: number;
}

interface SplitFeePermission {
  _id: string;
  email?: string;
  studentId?: string;
  createdAt?: string;
}

const FeeManagement = () => {
  const [fees, setFees] = useState<any[]>([]);
  const [splitPermissions, setSplitPermissions] = useState<SplitFeePermission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newFee, setNewFee] = useState({
    hostelId: '',
    roomType: '',
    hostelYear: '',
    caste: '',
    studentType: 'new',
    amount: '',
    deposit: ''
  });
  const [newSplitPermission, setNewSplitPermission] = useState({
    email: '',
    studentId: ''
  });
  const [isAddingFee, setIsAddingFee] = useState(false);
  const [isAddingSplit, setIsAddingSplit] = useState(false);
  const { toast } = useToast();
  const [editFee, setEditFee] = useState<any | null>(null);
  const [editFeeData, setEditFeeData] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hostels, setHostels] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    roomTypes: [],
    hostelYears: [],
    castes: []
  });

  useEffect(() => {
    axios.get('/api/dropdowns/hostels').then(res => setHostels(res.data));
    axios.get('/api/admin/settings').then(res => setSettings(res.data));
  }, []);

  const fetchFees = async () => {
    try {
      const res = await axios.get("/api/admin/fees");
      setFees(res.data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch fees.", variant: "destructive" });
    }
  };

  useEffect(() => { fetchFees(); }, []);

  const handleAddFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFee.hostelId || !newFee.roomType || !newFee.hostelYear || !newFee.caste || !newFee.studentType || !newFee.amount) return;

    const fee = {
      hostelYear: newFee.hostelYear,
      roomType: newFee.roomType,
      category: newFee.caste,
      hostelName: hostels.find(h => h._id === newFee.hostelId)?.name || '',
      studentType: newFee.studentType,
      amount: parseInt(newFee.amount),
      deposit: parseInt(newFee.deposit)
    };

    try {
      await axios.post("/api/admin/fee", fee);
      toast({ title: "Fee Added", description: `Fee has been added successfully.` });
      setNewFee({
        hostelId: '',
        roomType: '',
        hostelYear: '',
        caste: '',
        studentType: 'new',
        amount: '',
        deposit: ''
      });
      setIsAddingFee(false);
      fetchFees();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to add fee.", variant: "destructive" });
    }
  };

  const fetchSplitPermissions = async () => {
    try {
      const res = await axios.get('/api/admin/split-fee');
      setSplitPermissions(res.data);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch split fee permissions.', variant: 'destructive' });
    }
  };

  useEffect(() => { fetchSplitPermissions(); }, []);

  const handleAddSplitPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSplitPermission.email && !newSplitPermission.studentId) return;
    try {
      await axios.post('/api/admin/split-fee', newSplitPermission);
      toast({ title: 'Split Fee Permission Granted', description: 'Student can now pay in installments.' });
      setNewSplitPermission({ email: '', studentId: '' });
      setIsAddingSplit(false);
      fetchSplitPermissions();
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to grant permission.', variant: 'destructive' });
    }
  };

  const handleRevokeSplitPermission = async (perm: SplitFeePermission) => {
    if (!window.confirm('Revoke split fee permission for this student?')) return;
    try {
      await axios.delete('/api/admin/split-fee', { data: { email: perm.email, studentId: perm.studentId } });
      toast({ title: 'Permission Revoked', description: 'Split fee permission revoked.' });
      fetchSplitPermissions();
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to revoke permission.', variant: 'destructive' });
    }
  };

  const getHostelName = (fee: any) => {
    if (fee.hostelId) {
      return hostels.find(h => h._id === fee.hostelId)?.name || fee.hostelName || 'Unknown Hostel';
    }
    return fee.hostelName || 'Unknown Hostel';
  };

  const handleDeleteFee = async (id: string) => {
    if (!window.confirm("Delete this fee?")) return;
    try {
      await axios.delete(`/api/admin/fee/${id}`);
      toast({ title: "Fee Removed", description: "Fee has been removed successfully." });
      fetchFees();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to delete fee.", variant: "destructive" });
    }
  };

  const openEditModal = async (fee: any) => {
    // Fetch latest settings and hostels for up-to-date dropdowns
    const [hostelsRes, settingsRes] = await Promise.all([
      axios.get('/api/dropdowns/hostels'),
      axios.get('/api/admin/settings')
    ]);
    setHostels(hostelsRes.data);
    setSettings(settingsRes.data);

    // Find the hostelId from hostelName
    const hostel = hostelsRes.data.find((h: any) => h.name === fee.hostelName);
    setEditFee(fee);
    setEditFeeData({ ...fee, hostelId: hostel ? hostel._id : '' });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditFee(null);
    setEditFeeData(null);
  };

  const handleEditFeeChange = (field: string, value: any) => {
    setEditFeeData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveEditFee = async () => {
    // Validate required fields
    if (!editFeeData.hostelId || !editFeeData.roomType || !editFeeData.hostelYear || !editFeeData.category) {
      toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    try {
      await axios.put(`/api/admin/fee/${editFee._id || editFee.id}`, editFeeData);
      toast({ title: "Fee Updated", description: "Fee structure updated successfully." });
      closeEditModal();
      fetchFees();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to update fee.", variant: "destructive" });
    }
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
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Fee Structure
            </Button>
          </CardTitle>
          <CardDescription>
            Configure fees for different hostels, room types, years, and categories
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isAddingFee && (
            <form onSubmit={handleAddFeeStructure} className="mb-6 p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="hostel">Hostel Name</Label>
                  <Select value={newFee.hostelId} onValueChange={(value) => setNewFee({...newFee, hostelId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hostel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostels.map(hostel => (
                        <SelectItem key={hostel._id} value={hostel._id}>{hostel.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="room-type">Room Type</Label>
                  <Select value={newFee.roomType} onValueChange={(value) => setNewFee({...newFee, roomType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.roomTypes.map((type: string) => (
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
                      {settings.hostelYears.map((year: string) => (
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
                      {settings.castes.map((caste: string) => (
                        <SelectItem key={caste} value={caste}>{caste}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="student-type">Student Type</Label>
                  <Select value={newFee.studentType} onValueChange={(value) => setNewFee({...newFee, studentType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New Student</SelectItem>
                      <SelectItem value="existing">Existing Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={newFee.amount}
                    onChange={(e) => setNewFee({...newFee, amount: e.target.value.replace(/\D/g, '')})}
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deposit">Deposit Amount</Label>
                  <Input
                    id="deposit"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={newFee.deposit}
                    onChange={(e) => setNewFee({...newFee, deposit: e.target.value.replace(/\D/g, '')})}
                    placeholder="Enter deposit amount"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">
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
                  <TableHead>Hostel Name</TableHead>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Hostel Year</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Student Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Deposit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map((fee) => (
                  <TableRow key={fee._id || fee.id}>
                    <TableCell className="font-medium">{getHostelName(fee)}</TableCell>
                    <TableCell>{fee.roomType}</TableCell>
                    <TableCell>{fee.hostelYear}</TableCell>
                    <TableCell>{fee.category}</TableCell>
                    <TableCell>{fee.studentType === 'new' ? 'New Student' : 'Existing Student'}</TableCell>
                    <TableCell>{formatCurrency(fee.amount)}</TableCell>
                    <TableCell>{formatCurrency(fee.deposit)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(fee)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteFee(fee._id || fee.id)}>
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
            <Button onClick={() => setIsAddingSplit(!isAddingSplit)}>
              <Users className="w-4 h-4 mr-2" />
              Grant Access
            </Button>
          </CardTitle>
          <CardDescription>
            Manage which students can pay fees in installments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search/filter input */}
          <div className="mb-4 flex items-center gap-2">
            <Input
              type="text"
              placeholder="Search by email or student ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            {searchTerm && (
              <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>Clear</Button>
            )}
          </div>
          {isAddingSplit && (
            <form onSubmit={handleAddSplitPermission} className="mb-6 p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="student-email">Student Email</Label>
                  <Input
                    id="student-email"
                    type="email"
                    value={newSplitPermission.email}
                    onChange={(e) => setNewSplitPermission({ ...newSplitPermission, email: e.target.value })}
                    placeholder="Enter student email"
                  />
                </div>
                <div>
                  <Label htmlFor="student-id">Student ID</Label>
                  <Input
                    id="student-id"
                    type="text"
                    value={newSplitPermission.studentId}
                    onChange={(e) => setNewSplitPermission({ ...newSplitPermission, studentId: e.target.value })}
                    placeholder="Enter student ID"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Grant Access</Button>
                <Button type="button" variant="outline" onClick={() => setIsAddingSplit(false)}>Cancel</Button>
              </div>
            </form>
          )}
          {splitPermissions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Granted At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {splitPermissions.map((perm) => (
                    <TableRow key={perm._id}>
                      <TableCell className="font-medium">{perm.email || '-'}</TableCell>
                      <TableCell>{perm.studentId || '-'}</TableCell>
                      <TableCell>{perm.createdAt ? new Date(perm.createdAt).toLocaleString() : '-'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleRevokeSplitPermission(perm)}>
                          Revoke
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

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fee Structure</DialogTitle>
            <DialogDescription>
              Update the details for this fee structure. All fields are required.
            </DialogDescription>
          </DialogHeader>
          {editFeeData && (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSaveEditFee(); }}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="edit-hostel">Hostel Name</Label>
                  <Select value={editFeeData.hostelId} onValueChange={value => handleEditFeeChange('hostelId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hostel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostels.map(hostel => (
                        <SelectItem key={hostel._id} value={hostel._id}>{hostel.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-room-type">Room Type</Label>
                  <Select value={editFeeData.roomType} onValueChange={value => handleEditFeeChange('roomType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.roomTypes.map((type: string) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-hostel-year">Hostel Year</Label>
                  <Select value={editFeeData.hostelYear} onValueChange={value => handleEditFeeChange('hostelYear', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.hostelYears.map((year: string) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={editFeeData.category} onValueChange={value => handleEditFeeChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.castes.map((caste: string) => (
                        <SelectItem key={caste} value={caste}>{caste}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-student-type">Student Type</Label>
                  <Select
                    value={editFeeData.studentType}
                    onValueChange={(value) => handleEditFeeChange('studentType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New Student</SelectItem>
                      <SelectItem value="existing">Existing Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-amount">Amount</Label>
                  <Input
                    id="edit-amount"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={editFeeData.amount}
                    onChange={e => handleEditFeeChange('amount', e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-deposit">Deposit Amount</Label>
                  <Input
                    id="edit-deposit"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={editFeeData.deposit}
                    onChange={e => handleEditFeeChange('deposit', e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>
              <DialogFooter className="flex justify-end space-x-2 mt-4">
                <Button type="button" variant="outline" onClick={closeEditModal}>Cancel</Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeeManagement;