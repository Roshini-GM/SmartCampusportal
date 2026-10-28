import { UserRole } from '../types';

export interface RolePermissions {
  allowedTabs: string[];
  canCreateDrives: boolean;
  canApplyToDrives: boolean;
  canReviewApplicants: boolean;
  canScheduleInterviews: boolean;
  canIssueOffers: boolean;
  canPublishResults: boolean;
  canViewReports: boolean;
  canSendAnnouncements: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  student: {
    allowedTabs: [
      'dashboard',
      'profile',
      'resume',
      'drives',
      'internships',
      'applications',
      'interviews',
      'offers',
      'notifications',
      'settings',
    ],
    canCreateDrives: false,
    canApplyToDrives: true,
    canReviewApplicants: false,
    canScheduleInterviews: false,
    canIssueOffers: false,
    canPublishResults: false,
    canViewReports: false,
    canSendAnnouncements: false,
  },
  admin: {
    allowedTabs: [
      'dashboard',
      'students',
      'companies',
      'drives',
      'applications',
      'shortlisted',
      'interviews',
      'results',
      'offers',
      'announcements',
      'reports',
      'settings',
    ],
    canCreateDrives: true,
    canApplyToDrives: false,
    canReviewApplicants: true,
    canScheduleInterviews: true,
    canIssueOffers: true,
    canPublishResults: true,
    canViewReports: true,
    canSendAnnouncements: true,
  },
  recruiter: {
    allowedTabs: [
      'dashboard',
      'company_profile',
      'post_job',
      'manage_jobs',
      'applicants',
      'shortlisted',
      'interviews',
      'selected',
    ],
    canCreateDrives: true,
    canApplyToDrives: false,
    canReviewApplicants: true,
    canScheduleInterviews: true,
    canIssueOffers: true,
    canPublishResults: false,
    canViewReports: false,
    canSendAnnouncements: false,
  },
};

export function isTabAllowedForRole(tab: string, role: UserRole): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.allowedTabs.includes(tab);
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Placement Officer / Administrator';
    case 'recruiter':
      return 'Corporate Recruiter Partner';
    case 'student':
      return 'Final-Year Graduating Student';
    default:
      return role;
  }
}
