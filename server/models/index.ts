import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'admin' | 'recruiter';
  avatar?: string;
  createdAt: string;
}

const UserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  role: { type: String, enum: ['student', 'admin', 'recruiter'], required: true },
  avatar: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// Student Profile Schema
export interface IStudentProfile extends Document {
  id: string;
  userId: string;
  name: string;
  email: string;
  registerNumber: string;
  department: string;
  year: string;
  cgpa: number;
  backlogs: number;
  skills: string[];
  certifications: Array<{
    id?: string;
    title: string;
    issuer: string;
    year: number;
  }>;
  projects: Array<{
    id?: string;
    title: string;
    description: string;
    techStack: string[];
    link?: string;
  }>;
  resumeUrl: string;
  resumeName?: string;
  placed: boolean;
  placedCompany?: string;
  placedPackage?: number;
}

const StudentProfileSchema = new Schema<IStudentProfile>({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  registerNumber: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: String, required: true },
  cgpa: { type: Number, required: true, min: 0, max: 10 },
  backlogs: { type: Number, default: 0 },
  skills: [{ type: String }],
  certifications: [
    {
      id: String,
      title: String,
      issuer: String,
      year: Number,
    },
  ],
  projects: [
    {
      id: String,
      title: String,
      description: String,
      techStack: [String],
      link: String,
    },
  ],
  resumeUrl: { type: String, default: '#' },
  resumeName: { type: String, default: 'Resume.pdf' },
  placed: { type: Boolean, default: false },
  placedCompany: String,
  placedPackage: Number,
});

export const StudentProfileModel =
  mongoose.models.StudentProfile || mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);

// Company Schema
export interface ICompany extends Document {
  id: string;
  name: string;
  industry: string;
  location: string;
  website: string;
  description: string;
  tier: 'Dream' | 'Super Dream' | 'Regular';
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  logo: string;
  userId?: string;
}

const CompanySchema = new Schema<ICompany>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  industry: { type: String, required: true },
  location: { type: String, required: true },
  website: { type: String, default: '' },
  description: { type: String, default: '' },
  tier: { type: String, enum: ['Dream', 'Super Dream', 'Regular'], default: 'Regular' },
  contactPerson: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  logo: { type: String, default: '' },
  userId: String,
});

export const CompanyModel =
  mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);

// Placement Drive Schema
export interface IPlacementDrive extends Document {
  id: string;
  title: string;
  companyName: string;
  companyId: string;
  role: string;
  type: 'Full-Time' | 'Internship' | 'Internship + PPO';
  salary: string;
  salaryNumber: number;
  location: string;
  minCgpa: number;
  eligibleDepartments: string[];
  allowedBacklogs: number;
  registrationDeadline: string;
  driveDate: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  selectionProcess: string[];
  vacancies: number;
  requirements: string[];
  description?: string;
  createdAt?: string;
}

const PlacementDriveSchema = new Schema<IPlacementDrive>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  companyName: { type: String, required: true },
  companyId: { type: String, required: true },
  role: { type: String, required: true },
  type: {
    type: String,
    enum: ['Full-Time', 'Internship', 'Internship + PPO'],
    default: 'Full-Time',
  },
  salary: { type: String, required: true },
  salaryNumber: { type: Number, default: 0 },
  location: { type: String, required: true },
  minCgpa: { type: Number, default: 6.0 },
  eligibleDepartments: [{ type: String }],
  allowedBacklogs: { type: Number, default: 0 },
  registrationDeadline: { type: String, required: true },
  driveDate: { type: String, required: true },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'active',
  },
  selectionProcess: [{ type: String }],
  vacancies: { type: Number, default: 1 },
  requirements: [{ type: String }],
  description: String,
  createdAt: { type: String, default: () => new Date().toISOString() },
});

export const PlacementDriveModel =
  mongoose.models.PlacementDrive ||
  mongoose.model<IPlacementDrive>('PlacementDrive', PlacementDriveSchema);

// Application Schema
export interface IApplication extends Document {
  id: string;
  driveId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  registerNumber: string;
  department: string;
  cgpa: number;
  companyName: string;
  role: string;
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'Offered' | 'Rejected';
  appliedDate: string;
  updatedDate: string;
  feedback?: string;
}

const ApplicationSchema = new Schema<IApplication>({
  id: { type: String, required: true, unique: true },
  driveId: { type: String, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  registerNumber: { type: String, required: true },
  department: { type: String, required: true },
  cgpa: { type: Number, required: true },
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Offered', 'Rejected'],
    default: 'Applied',
  },
  appliedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  updatedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  feedback: String,
});

export const ApplicationModel =
  mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);

// Interview Schema
export interface IInterview extends Document {
  id: string;
  applicationId: string;
  studentId: string;
  studentName: string;
  companyName: string;
  role: string;
  round: string;
  date: string;
  time: string;
  mode: 'Online' | 'Offline';
  meetingLink?: string;
  location?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  feedback?: string;
}

const InterviewSchema = new Schema<IInterview>({
  id: { type: String, required: true, unique: true },
  applicationId: { type: String, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  round: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  mode: { type: String, enum: ['Online', 'Offline'], default: 'Online' },
  meetingLink: String,
  location: String,
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
    default: 'Scheduled',
  },
  feedback: String,
});

export const InterviewModel =
  mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema);

// Offer Schema
export interface IOffer extends Document {
  id: string;
  studentId: string;
  studentName: string;
  companyName: string;
  role: string;
  ctc: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  issueDate: string;
  validUntil: string;
  acceptanceDate?: string;
  offerLetterUrl?: string;
}

const OfferSchema = new Schema<IOffer>({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  ctc: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Declined'],
    default: 'Pending',
  },
  issueDate: { type: String, required: true },
  validUntil: { type: String, required: true },
  acceptanceDate: String,
  offerLetterUrl: String,
});

export const OfferModel = mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);

// Announcement Schema
export interface IAnnouncement extends Document {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  authorRole: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  targetRoles: Array<'student' | 'recruiter' | 'admin'>;
  pinned: boolean;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  author: { type: String, required: true },
  authorRole: { type: String, default: 'Placement Officer' },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  targetRoles: [{ type: String, enum: ['student', 'recruiter', 'admin'] }],
  pinned: { type: Boolean, default: false },
});

export const AnnouncementModel =
  mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);

// Notification Schema
export interface INotificationItem extends Document {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'drive' | 'interview' | 'offer' | 'system' | 'announcement';
  date: string;
  read: boolean;
  linkTab?: string;
}

const NotificationSchema = new Schema<INotificationItem>({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['drive', 'interview', 'offer', 'system', 'announcement'],
    default: 'system',
  },
  date: { type: String, default: () => new Date().toISOString() },
  read: { type: Boolean, default: false },
  linkTab: String,
});

export const NotificationModel =
  mongoose.models.Notification || mongoose.model<INotificationItem>('Notification', NotificationSchema);
