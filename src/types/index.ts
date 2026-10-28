export type UserRole = 'student' | 'admin' | 'recruiter';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  avatar?: string;
  createdAt: string;
}

export interface Certification {
  id?: string;
  title: string;
  issuer: string;
  year: number;
}

export interface StudentProject {
  id?: string;
  title: string;
  description: string;
  techStack: string[];
  link?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  registerNumber: string;
  department: string;
  year: string; // e.g. "4th Year"
  cgpa: number;
  backlogs: number;
  skills: string[];
  certifications: Certification[];
  projects: StudentProject[];
  resumeUrl: string;
  resumeName: string;
  placed: boolean;
  placedCompany?: string;
  placedPackage?: number;
  phone?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  bio?: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  description: string;
  website: string;
  location: string;
  industry: string;
  logo?: string;
  contactPerson: string;
  contactEmail?: string;
  contactPhone?: string;
  userId?: string;
  status: 'active' | 'verified' | 'pending';
}

export type DriveType = 'Full-Time' | 'Internship' | 'Internship + PPO';

export interface PlacementDrive {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  role: string;
  type: DriveType;
  description: string;
  packageLpa: number; // e.g. 14.5 for 14.5 LPA
  stipendPerMonth?: number; // for internship
  location: string;
  requiredSkills: string[];
  minCgpa: number;
  eligibleDepartments: string[]; // e.g. ['Computer Science', 'Information Technology']
  graduationYear: number;
  maxBacklogs: number;
  deadline: string; // YYYY-MM-DD
  driveDate: string;
  rounds: string[];
  status: 'active' | 'closed' | 'completed';
  createdAt: string;
}

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Selected'
  | 'Offered'
  | 'Rejected';

export interface Application {
  id: string;
  studentId: string;
  studentName: string;
  studentRegNo: string;
  studentDept: string;
  studentCgpa: number;
  driveId: string;
  companyName: string;
  companyLogo?: string;
  role: string;
  packageLpa: number;
  status: ApplicationStatus;
  appliedDate: string;
  updatedDate?: string;
  feedback?: string;
  notes?: string;
  interviewId?: string;
  offerId?: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  studentId: string;
  studentName: string;
  studentRegNo?: string;
  companyName: string;
  role: string;
  roundName: string;
  date: string;
  time: string;
  mode: 'Online' | 'In-Person' | 'Telephonic';
  locationOrLink: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  feedback?: string;
}

export interface Offer {
  id: string;
  studentId: string;
  studentName: string;
  studentRegNo?: string;
  companyName: string;
  companyLogo?: string;
  role: string;
  packageLpa: number;
  joiningDate: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  issuedDate: string;
  acceptanceDate?: string;
  letterText?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'drive' | 'application' | 'shortlist' | 'interview' | 'result' | 'offer' | 'announcement';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: 'all' | 'students' | 'recruiters';
  priority: 'normal' | 'high' | 'urgent';
  date: string;
  author: string;
  pinned?: boolean;
}

export interface EligibilityResult {
  isEligible: boolean;
  cgpaSatisfied: boolean;
  deptSatisfied: boolean;
  yearSatisfied: boolean;
  backlogSatisfied: boolean;
  reasons: string[];
}
