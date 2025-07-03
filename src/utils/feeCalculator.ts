import { FeeStructure, SplitPaymentAccess } from '@/types';

export interface FeeCalculation {
  baseFee: number;
  deposit: number;
  totalFee: number;
  installmentAmount?: number;
  canSplitPayment: boolean;
  installments?: number;
}

export const calculateFee = (
  roomType: string,
  hostelYear: string,
  caste: string,
  studentType: 'new' | 'existing',
  feeStructures: FeeStructure[],
  splitAccess?: SplitPaymentAccess
): FeeCalculation => {
  // Find matching fee structure
  const feeStructure = feeStructures.find(
    fs => fs.roomTypeId === roomType && 
         fs.hostelYear === hostelYear && 
         fs.caste === caste
  );
  
  if (!feeStructure) {
    // Default fee structure if not found
    const baseFee = roomType.includes('2') ? 85000 : 95000;
    const deposit = studentType === 'new' ? 10000 : 0;
    
    return {
      baseFee,
      deposit,
      totalFee: baseFee + deposit,
      canSplitPayment: false
    };
  }
  
  const baseFee = studentType === 'new' ? 
    feeStructure.newStudentFee : 
    feeStructure.existingStudentFee;
  
  const deposit = studentType === 'new' ? feeStructure.deposit : 0;
  const totalFee = baseFee + deposit;
  
  const canSplitPayment = splitAccess?.isActive || false;
  const installments = splitAccess?.installments || 2;
  const installmentAmount = canSplitPayment ? totalFee / installments : undefined;
  
  return {
    baseFee,
    deposit,
    totalFee,
    installmentAmount,
    canSplitPayment,
    installments: canSplitPayment ? installments : undefined
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};