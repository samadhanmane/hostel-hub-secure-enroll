export const generateStudentId = (
  hostelYear: string,
  academicYear: string,
  collegeName: string,
  roomCapacity: number,
  hostelType: 'boys' | 'girls'
): string => {
  // Extract year from hostel year (e.g., "2025-2026" -> "2025")
  const year = hostelYear.split('-')[0];
  
  // Academic year mapping
  const yearMapping: { [key: string]: string } = {
    'First Year': 'FY',
    'Second Year': 'SY',
    'Third Year': 'TY',
    'Fourth Year': 'LY' // Last Year
  };
  
  // College code extraction (first letters of each word)
  const collegeCode = collegeName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2) // Take first 2 words
    .join('');
  
  // Academic year code
  const academicCode = yearMapping[academicYear] || 'FY';
  
  // Room capacity
  const roomCode = roomCapacity.toString();
  
  // Hostel type (B for boys, G for girls)
  const hostelCode = hostelType === 'boys' ? 'B' : 'G';
  
  // Format: YEAR + ACADEMIC_YEAR + COLLEGE_CODE + ROOM_CAPACITY + HOSTEL_TYPE
  // Example: 2025FYMA2B (2025 + FY + MA + 2 + B)
  return `${year}${academicCode}${collegeCode}${roomCode}${hostelCode}`;
};

export const validateStudentId = (studentId: string): boolean => {
  // Student ID should be in format: YYYYAAAACCRC (12 characters)
  // YYYY = year, AA = academic year, CC = college code, R = room capacity, C = hostel type
  const regex = /^\d{4}[A-Z]{2}[A-Z]{2}\d[BG]$/;
  return regex.test(studentId);
};