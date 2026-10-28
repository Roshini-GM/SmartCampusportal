import { StudentProfile, PlacementDrive, EligibilityResult } from '../types';

export function checkEligibility(
  student: StudentProfile | null | undefined,
  drive: PlacementDrive
): EligibilityResult {
  if (!student) {
    return {
      isEligible: false,
      cgpaSatisfied: false,
      deptSatisfied: false,
      yearSatisfied: false,
      backlogSatisfied: false,
      reasons: ['Please log in with a student profile to check eligibility.'],
    };
  }

  const reasons: string[] = [];

  // 1. CGPA Check
  const cgpaSatisfied = student.cgpa >= drive.minCgpa;
  if (cgpaSatisfied) {
    reasons.push(`✓ CGPA requirement satisfied (Your CGPA: ${student.cgpa.toFixed(2)} ≥ Required: ${drive.minCgpa})`);
  } else {
    reasons.push(`✗ CGPA requirement not satisfied (Your CGPA: ${student.cgpa.toFixed(2)} < Required: ${drive.minCgpa})`);
  }

  // 2. Department Check
  const deptMatch =
    drive.eligibleDepartments.includes('All Branches') ||
    drive.eligibleDepartments.some(
      (dept) => dept.toLowerCase().trim() === student.department.toLowerCase().trim()
    );
  if (deptMatch) {
    reasons.push(`✓ Department eligible (${student.department})`);
  } else {
    reasons.push(`✗ Department not eligible (Eligible: ${drive.eligibleDepartments.join(', ')})`);
  }

  // 3. Graduation Year Check
  // Map "4th Year" to 2026, "3rd Year" to 2027, etc. or direct match
  let studentGradYear = 2026;
  if (student.year.includes('4th') || student.year === '4' || student.year.includes('2026')) {
    studentGradYear = 2026;
  } else if (student.year.includes('3rd') || student.year === '3' || student.year.includes('2027')) {
    studentGradYear = 2027;
  } else if (student.year.includes('2nd') || student.year === '2' || student.year.includes('2028')) {
    studentGradYear = 2028;
  }
  
  const yearSatisfied =
    drive.graduationYear === 0 ||
    drive.graduationYear === studentGradYear ||
    drive.type.includes('Internship'); // Internships often allow pre-final years

  if (yearSatisfied) {
    reasons.push(`✓ Graduation year eligible (Class of ${studentGradYear})`);
  } else {
    reasons.push(`✗ Graduation year requirement not satisfied (Required: ${drive.graduationYear}, Yours: ${studentGradYear})`);
  }

  // 4. Backlog / Arrears Check
  const backlogSatisfied = student.backlogs <= drive.maxBacklogs;
  if (backlogSatisfied) {
    reasons.push(`✓ Backlog requirement satisfied (Active arrears: ${student.backlogs} ≤ Allowed: ${drive.maxBacklogs})`);
  } else {
    reasons.push(`✗ Backlog requirement not satisfied (Active arrears: ${student.backlogs} > Allowed: ${drive.maxBacklogs})`);
  }

  const isEligible = cgpaSatisfied && deptMatch && yearSatisfied && backlogSatisfied;

  return {
    isEligible,
    cgpaSatisfied,
    deptSatisfied: deptMatch,
    yearSatisfied,
    backlogSatisfied,
    reasons,
  };
}
