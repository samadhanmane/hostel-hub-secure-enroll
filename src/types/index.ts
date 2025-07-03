export interface Student {
  id: string;
  name: string;
  email: string;
  contact: string;
  collegeId: string;
  yearOfAdmission: string;
  academicYear: string;
  branch: string;
  hostelType: 'boys' | 'girls';
  hostelId: string;
  roomType: string;
  studentType: 'new' | 'existing';
  caste: string;
  hostelYear: string;
  createdAt: Date;
}

export interface College {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
}

export interface Hostel {
  id: string;
  name: string;
  type: 'boys' | 'girls';
  collegeId: string;
  createdAt: Date;
}

export interface RoomType {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
}

export interface FeeStructure {
  id: string;
  roomTypeId: string;
  hostelYear: string;
  caste: string;
  newStudentFee: number;
  existingStudentFee: number;
  deposit: number;
  createdAt: Date;
}

export interface SplitPaymentAccess {
  id: string;
  studentEmail: string;
  studentId?: string;
  isActive: boolean;
  installments: number;
  createdAt: Date;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  feeType: 'full' | 'installment';
  installmentNumber?: number;
  totalInstallments?: number;
  status: 'pending' | 'completed' | 'failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
}

export interface AdminConfig {
  academicYears: string[];
  branches: string[];
  castes: string[];
  hostelYears: string[];
  roomTypes: RoomType[];
}