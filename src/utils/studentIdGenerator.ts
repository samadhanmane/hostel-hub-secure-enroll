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
  
  // College code extraction (first letters of each word, max 4 chars)
  const collegeCode = collegeName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2) // Take first 2 words
    .join('');
  
  // Academic year code
  const academicCode = yearMapping[academicYear] || 'FY';
  
  // Room type code (first 2 letters)
  const roomCode = roomCapacity.toString().padStart(2, '0');
  
  // Hostel type (B for boys, G for girls)
  const hostelCode = hostelType === 'boys' ? 'B' : 'G';
  
  // Add timestamp for uniqueness (last 4 digits)
  const timestamp = Date.now().toString().slice(-4);
  
  // Format: YEAR + ACADEMIC_YEAR + COLLEGE_CODE + ROOM_CAPACITY + HOSTEL_TYPE + TIMESTAMP
  // Example: 2025FYMA02B1234 (2025 + FY + MA + 02 + B + 1234)
  return `${year}${academicCode}${collegeCode}${roomCode}${hostelCode}${timestamp}`;
};

export const validateStudentId = (studentId: string): boolean => {
  // Student ID should be in format: YYYYAAAACCRRCTTTT (16 characters)
  // YYYY = year, AA = academic year, CC = college code, RR = room capacity, C = hostel type, TTTT = timestamp
  const regex = /^\d{4}[A-Z]{2}[A-Z]{2}\d{2}[BG]\d{4}$/;
  return regex.test(studentId);
};