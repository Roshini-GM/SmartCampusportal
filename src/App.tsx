import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  UserRole,
  StudentProfile,
  Company,
  PlacementDrive,
  Application,
  Interview,
  Offer,
  NotificationItem,
  Announcement,
} from './types';
import { authService } from './services/authService';
import { storageService } from './services/storageService';
import { ToastProvider, useToast } from './components/common/Toast';
import { Sidebar } from './components/common/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import {
  StudentRegisterModal,
  RecruiterRegisterModal,
  AdminRegisterModal,
} from './components/auth/AuthModals';
import { EditProfileModal } from './components/common/EditProfileModal';
import { AccessDeniedView } from './components/common/AccessDeniedView';
import { isTabAllowedForRole } from './utils/rbac';

// Student Components
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentProfileView } from './components/student/StudentProfile';
import { StudentResume } from './components/student/StudentResume';
import { StudentDrivesView } from './components/student/StudentDrivesView';
import { MyApplications } from './components/student/MyApplications';
import { StudentInterviews } from './components/student/StudentInterviews';
import { StudentOffers } from './components/student/StudentOffers';
import { StudentNotifications } from './components/student/StudentNotifications';
import { StudentSettings } from './components/student/StudentSettings';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentManagement } from './components/admin/StudentManagement';
import { CompanyManagement } from './components/admin/CompanyManagement';
import { DriveManagement } from './components/admin/DriveManagement';
import { ApplicationManagement } from './components/admin/ApplicationManagement';
import { ShortlistedCandidates } from './components/admin/ShortlistedCandidates';
import { AdminInterviews } from './components/admin/AdminInterviews';
import { ResultsAndOffers } from './components/admin/ResultsAndOffers';
import { PlacementReports } from './components/admin/PlacementReports';
import { AnnouncementsManagement } from './components/admin/AnnouncementsManagement';
import { AdminSettings } from './components/admin/AdminSettings';

// Recruiter Components
import {
  RecruiterDashboardView,
  CompanyProfileView,
} from './components/recruiter/RecruiterComponents';
import { Menu, LogOut, Edit3, User as UserIcon, Bell } from 'lucide-react';

function MainAppContent() {
  const { showToast } = useToast();

  // Core Data States
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const [activeRole, setActiveRole] = useState<UserRole>(currentUser?.role || 'student');

  const [students, setStudents] = useState<StudentProfile[]>(storageService.getStudents());
  const [companies, setCompanies] = useState<Company[]>(storageService.getCompanies());
  const [drives, setDrives] = useState<PlacementDrive[]>(storageService.getDrives());
  const [applications, setApplications] = useState<Application[]>(storageService.getApplications());
  const [interviews, setInterviews] = useState<Interview[]>(storageService.getInterviews());
  const [offers, setOffers] = useState<Offer[]>(storageService.getOffers());
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    storageService.getNotifications()
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    storageService.getAnnouncements()
  );

  // Navigation state: 'portal' or 'login'
  const [viewMode, setViewMode] = useState<'portal' | 'login'>(currentUser ? 'portal' : 'login');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // Small profile logo dropdown state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [studentRegisterOpen, setStudentRegisterOpen] = useState(false);
  const [recruiterRegisterOpen, setRecruiterRegisterOpen] = useState(false);
  const [adminRegisterOpen, setAdminRegisterOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  // Cross-component scheduling preset
  const [presetAppForSchedule, setPresetAppForSchedule] = useState<Application | null>(null);

  // Sync state from storage and auth subscriptions
  useEffect(() => {
    const unsubAuth = authService.subscribe((user) => {
      setCurrentUser(user);
      if (user) {
        setActiveRole(user.role);
      } else {
        setViewMode('login');
      }
    });

    const unsubStorage = storageService.subscribe(() => {
      setStudents(storageService.getStudents());
      setCompanies(storageService.getCompanies());
      setDrives(storageService.getDrives());
      setApplications(storageService.getApplications());
      setInterviews(storageService.getInterviews());
      setOffers(storageService.getOffers());
      setNotifications(storageService.getNotifications());
      setAnnouncements(storageService.getAnnouncements());
    });

    return () => {
      unsubAuth();
      unsubStorage();
    };
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const refreshAllData = () => {
    setStudents(storageService.getStudents());
    setCompanies(storageService.getCompanies());
    setDrives(storageService.getDrives());
    setApplications(storageService.getApplications());
    setInterviews(storageService.getInterviews());
    setOffers(storageService.getOffers());
    setNotifications(storageService.getNotifications());
    setAnnouncements(storageService.getAnnouncements());
  };

  // Find active student & company for current user
  const currentStudent =
    students.find((s) => s.userId === currentUser?.id || s.email === currentUser?.email) ||
    students[0];

  const currentCompany =
    companies.find((c) => c.email.toLowerCase() === currentUser?.email?.toLowerCase()) ||
    companies[0];

  // Applications filtered for current student
  const studentApplications = applications.filter(
    (a) => a.studentId === currentStudent?.id || a.studentName === currentStudent?.name
  );

  // Interviews filtered for current student
  const studentInterviews = interviews.filter(
    (i) => i.studentId === currentStudent?.id || i.studentName === currentStudent?.name
  );

  // Offers filtered for current student
  const studentOffers = offers.filter(
    (o) => o.studentId === currentStudent?.id || o.studentName === currentStudent?.name
  );

  const handleSelectTab = (tab: string) => {
    setViewMode('portal');
    setActiveTab(tab);
  };

  const handleScheduleInterviewForApp = (app: Application) => {
    setPresetAppForSchedule(app);
    setActiveTab('interviews');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setShowProfileMenu(false);
    setViewMode('login');
    showToast('Logged out of session successfully', 'info');
  };

  const getPageTitle = (tab: string): string => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'profile':
        return 'My Academic Profile';
      case 'resume':
        return 'Resume & Documents';
      case 'drives':
        return 'Placement Drives';
      case 'internships':
        return 'Internship Opportunities';
      case 'applications':
        return 'My Applications';
      case 'interviews':
        return 'Interview Schedule';
      case 'offers':
        return 'Job Offers & Letters';
      case 'notifications':
        return 'Notifications & Announcements';
      case 'students':
        return 'Students Directory';
      case 'companies':
        return 'Partner Companies';
      case 'shortlisted':
        return 'Shortlisted Candidates';
      case 'results':
        return 'Placement Results';
      case 'reports':
        return 'Reports & Analytics';
      case 'announcements':
        return 'Campus Announcements';
      case 'settings':
        return 'Portal Settings';
      case 'company_profile':
        return 'Company Profile';
      case 'post_job':
        return 'Post New Drive';
      case 'manage_jobs':
        return 'Manage Postings';
      case 'applicants':
        return 'Applicants Review';
      case 'selected':
        return 'Selected Candidates';
      default:
        return tab.replace(/_/g, ' ');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col font-sans">
      {/* If logged out or in login view, show Dedicated Login Page */}
      {!currentUser || viewMode === 'login' ? (
        <LoginPage
          onLoginSuccess={(role) => {
            setActiveRole(role);
            setViewMode('portal');
            setActiveTab('dashboard');
          }}
          onOpenStudentRegister={() => setStudentRegisterOpen(true)}
          onOpenRecruiterRegister={() => setRecruiterRegisterOpen(true)}
          onOpenAdminRegister={() => setAdminRegisterOpen(true)}
        />
      ) : (
        <div className="flex-1 flex w-full min-h-screen">
          {/* Responsive Sidebar */}
          <Sidebar
            role={activeRole}
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            isOpenMobile={sidebarMobileOpen}
            onCloseMobile={() => setSidebarMobileOpen(false)}
            unreadCount={
              notifications.filter(
                (n) => !n.read && (n.userId === currentUser?.id || n.userId === 'all')
              ).length
            }
            offersCount={studentOffers.filter((o) => o.status === 'Pending').length}
            currentUser={currentUser}
            onOpenEditProfile={() => setEditProfileOpen(true)}
            onNavigateHome={() => handleLogout()}
            onLogout={handleLogout}
          />

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 flex flex-col min-h-screen">
            {/* Top Bar with Small Profile Logo, User Identity, and Logout */}
            <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-[#E7E7E4] bg-white flex items-center justify-between sticky top-0 z-30">
              {/* Left: Mobile Drawer Trigger + Active Page Title */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarMobileOpen(true)}
                  className="lg:hidden p-1.5 text-slate-700 hover:text-black rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Open Navigation"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight capitalize">
                    {getPageTitle(activeTab)}
                  </h1>
                </div>
              </div>

              {/* Right: Small Profile Logo with User Info & Logout Dropdown */}
              <div className="flex items-center gap-3" ref={profileMenuRef}>
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer group"
                    title="User Profile & Settings"
                  >
                    <span className="text-xs font-semibold text-slate-800 hidden sm:inline max-w-[130px] truncate">
                      {currentUser?.name || 'My Account'}
                    </span>
                    {/* Small Profile Logo */}
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs group-hover:bg-indigo-600 transition-colors">
                      {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                    </div>
                  </button>

                  {/* Profile Dropdown: Displays which user is logged in, Edit Profile, and Logout */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-fadeIn">
                      {/* Which user is logged in */}
                      <div className="p-3 bg-[#F7F7F5] rounded-xl border border-[#E7E7E4] mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm uppercase shrink-0">
                            {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate" title={currentUser?.name}>
                              {currentUser?.name}
                            </p>
                            <p className="text-2xs text-slate-500 truncate" title={currentUser?.email}>
                              {currentUser?.email}
                            </p>
                            <span className="inline-block mt-1 text-2xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full capitalize">
                              {currentUser?.role === 'admin'
                                ? 'Placement Officer'
                                : currentUser?.role === 'recruiter'
                                ? 'Corporate Recruiter'
                                : 'Graduating Student'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Options */}
                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            setEditProfileOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-black hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4 text-slate-500" />
                          <span>Edit Profile Settings</span>
                        </button>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Page Viewport */}
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-[#F7F7F5]">
              {/* RBAC Verification: If attempted tab is not permitted for the user's role */}
              {!isTabAllowedForRole(activeTab, activeRole) ? (
                <AccessDeniedView
                  currentRole={activeRole}
                  attemptedTab={activeTab}
                  onReturnToDashboard={() => setActiveTab('dashboard')}
                />
              ) : (
                <>
                  {/* Role-Specific Page Content */}
                  {activeRole === 'student' && (
                    <>
                      {activeTab === 'dashboard' && (
                        <StudentDashboard
                          student={currentStudent}
                          drives={drives}
                          applications={studentApplications}
                          interviews={studentInterviews}
                          offers={studentOffers}
                          onNavigateTab={setActiveTab}
                          onRefreshData={refreshAllData}
                        />
                      )}
                      {activeTab === 'profile' && (
                        <StudentProfileView
                          student={currentStudent}
                          onProfileUpdated={refreshAllData}
                        />
                      )}
                      {activeTab === 'resume' && (
                        <StudentResume student={currentStudent} onUpdated={refreshAllData} />
                      )}
                      {activeTab === 'drives' && (
                        <StudentDrivesView
                          drives={drives}
                          student={currentStudent}
                          applications={studentApplications}
                          initialTypeFilter="all"
                          title="Placement Drives (Campus Recruitment 2026)"
                          subtitle="Filter opportunities by CGPA, branch criteria, and compensation bracket"
                          onRefreshData={refreshAllData}
                        />
                      )}
                      {activeTab === 'internships' && (
                        <StudentDrivesView
                          drives={drives}
                          student={currentStudent}
                          applications={studentApplications}
                          initialTypeFilter="Internship"
                          title="Internship & Pre-Placement (PPO) Drives"
                          subtitle="Industry internships with monthly stipends and high conversion rates"
                          onRefreshData={refreshAllData}
                        />
                      )}
                      {activeTab === 'applications' && (
                        <MyApplications
                          applications={studentApplications}
                          interviews={studentInterviews}
                          offers={studentOffers}
                          onNavigateTab={setActiveTab}
                        />
                      )}
                      {activeTab === 'interviews' && (
                        <StudentInterviews interviews={studentInterviews} />
                      )}
                      {activeTab === 'offers' && (
                        <StudentOffers
                          offers={studentOffers}
                          student={currentStudent}
                          onRefreshData={refreshAllData}
                        />
                      )}
                      {activeTab === 'notifications' && (
                        <StudentNotifications
                          notifications={notifications}
                          announcements={announcements}
                          studentUserId={currentUser?.id || currentStudent?.userId}
                          onRefreshData={refreshAllData}
                        />
                      )}
                      {activeTab === 'settings' && (
                        <StudentSettings
                          student={currentStudent}
                          onOpenEditProfile={() => setEditProfileOpen(true)}
                        />
                      )}
                    </>
                  )}

                  {activeRole === 'admin' && (
                    <>
                      {activeTab === 'dashboard' && (
                        <AdminDashboard
                          students={students}
                          companies={companies}
                          drives={drives}
                          applications={applications}
                          interviews={interviews}
                          offers={offers}
                          announcements={announcements}
                          onNavigateTab={setActiveTab}
                          onRefreshData={refreshAllData}
                        />
                      )}
                      {activeTab === 'students' && (
                        <StudentManagement students={students} onRefreshData={refreshAllData} />
                      )}
                      {activeTab === 'companies' && (
                        <CompanyManagement
                          companies={companies}
                          drives={drives}
                          onRefreshData={refreshAllData}
                        />
                      )}
                      {activeTab === 'drives' && (
                        <DriveManagement
                          drives={drives}
                          companies={companies}
                          applications={applications}
                          onRefreshData={refreshAllData}
                          onNavigateTab={setActiveTab}
                        />
                      )}
                      {activeTab === 'applications' && (
                        <ApplicationManagement
                          applications={applications}
                          drives={drives}
                          onRefreshData={refreshAllData}
                          onScheduleInterviewForApp={handleScheduleInterviewForApp}
                        />
                      )}
                      {activeTab === 'shortlisted' && (
                        <ShortlistedCandidates
                          applications={applications}
                          students={students}
                          onScheduleInterview={handleScheduleInterviewForApp}
                          onNavigateTab={setActiveTab}
                        />
                      )}
                      {activeTab === 'interviews' && (
                        <AdminInterviews
                          interviews={interviews}
                          applications={applications}
                          students={students}
                          onRefreshData={refreshAllData}
                          presetAppForScheduling={presetAppForSchedule}
                          onClearPresetApp={() => setPresetAppForSchedule(null)}
                        />
                      )}
                      {(activeTab === 'results' || activeTab === 'offers') && (
                        <ResultsAndOffers
                          offers={offers}
                          applications={applications}
                          students={students}
                          companies={companies}
                          onRefreshData={refreshAllData}
                        />
                      )}
                      {activeTab === 'announcements' && (
                        <AnnouncementsManagement
                          announcements={announcements}
                          onRefreshData={refreshAllData}
                        />
                      )}
                      {activeTab === 'reports' && (
                        <PlacementReports
                          students={students}
                          companies={companies}
                          drives={drives}
                          applications={applications}
                          offers={offers}
                        />
                      )}
                      {activeTab === 'settings' && (
                        <AdminSettings
                          onRefreshData={refreshAllData}
                          onOpenEditProfile={() => setEditProfileOpen(true)}
                          onOpenAdminRegister={() => setAdminRegisterOpen(true)}
                        />
                      )}
                    </>
                  )}

                  {activeRole === 'recruiter' && (
                    <>
                      {(activeTab === 'dashboard' || activeTab === 'manage_jobs') && (
                        <RecruiterDashboardView
                          company={currentCompany}
                          drives={drives}
                          applications={applications}
                          interviews={interviews}
                          offers={offers}
                          students={students}
                          onRefreshData={refreshAllData}
                          onNavigateTab={setActiveTab}
                        />
                      )}
                      {activeTab === 'company_profile' && (
                        <CompanyProfileView
                          company={currentCompany}
                          onRefreshData={refreshAllData}
                          onOpenEditProfile={() => setEditProfileOpen(true)}
                        />
                      )}
                      {activeTab === 'post_job' && (
                        <DriveManagement
                          drives={drives.filter(
                            (d) =>
                              d.companyId === currentCompany.id ||
                              d.companyName.toLowerCase() === currentCompany.name.toLowerCase()
                          )}
                          companies={[currentCompany]}
                          applications={applications}
                          onRefreshData={refreshAllData}
                          onNavigateTab={setActiveTab}
                        />
                      )}
                      {activeTab === 'applicants' && (
                        <ApplicationManagement
                          applications={applications.filter((a) =>
                            a.companyName
                              .toLowerCase()
                              .includes(currentCompany.name.toLowerCase().split(' ')[0])
                          )}
                          drives={drives.filter(
                            (d) =>
                              d.companyId === currentCompany.id ||
                              d.companyName.toLowerCase() === currentCompany.name.toLowerCase()
                          )}
                          onRefreshData={refreshAllData}
                          onScheduleInterviewForApp={handleScheduleInterviewForApp}
                        />
                      )}
                      {activeTab === 'shortlisted' && (
                        <ShortlistedCandidates
                          applications={applications.filter((a) =>
                            a.companyName
                              .toLowerCase()
                              .includes(currentCompany.name.toLowerCase().split(' ')[0])
                          )}
                          students={students}
                          onScheduleInterview={handleScheduleInterviewForApp}
                          onNavigateTab={setActiveTab}
                        />
                      )}
                      {activeTab === 'interviews' && (
                        <AdminInterviews
                          interviews={interviews.filter((i) =>
                            i.companyName
                              .toLowerCase()
                              .includes(currentCompany.name.toLowerCase().split(' ')[0])
                          )}
                          applications={applications}
                          students={students}
                          onRefreshData={refreshAllData}
                          presetAppForScheduling={presetAppForSchedule}
                          onClearPresetApp={() => setPresetAppForSchedule(null)}
                        />
                      )}
                      {activeTab === 'selected' && (
                        <ResultsAndOffers
                          offers={offers.filter((o) =>
                            o.companyName
                              .toLowerCase()
                              .includes(currentCompany.name.toLowerCase().split(' ')[0])
                          )}
                          applications={applications.filter((a) =>
                            a.companyName
                              .toLowerCase()
                              .includes(currentCompany.name.toLowerCase().split(' ')[0])
                          )}
                          students={students}
                          companies={[currentCompany]}
                          onRefreshData={refreshAllData}
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Global Edit Profile Modal */}
      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={refreshAllData}
      />

      {/* Registration Modals */}
      <StudentRegisterModal
        isOpen={studentRegisterOpen}
        onClose={() => setStudentRegisterOpen(false)}
        onSuccess={() => {
          setViewMode('portal');
          setActiveTab('dashboard');
        }}
        onSwitchToLogin={() => {
          setStudentRegisterOpen(false);
          setViewMode('login');
        }}
      />

      <RecruiterRegisterModal
        isOpen={recruiterRegisterOpen}
        onClose={() => setRecruiterRegisterOpen(false)}
        onSuccess={() => {
          setViewMode('portal');
          setActiveTab('dashboard');
        }}
        onSwitchToLogin={() => {
          setRecruiterRegisterOpen(false);
          setViewMode('login');
        }}
      />

      <AdminRegisterModal
        isOpen={adminRegisterOpen}
        onClose={() => setAdminRegisterOpen(false)}
        onSuccess={() => {
          setViewMode('portal');
          setActiveTab('dashboard');
        }}
        onSwitchToLogin={() => {
          setAdminRegisterOpen(false);
          setViewMode('login');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainAppContent />
    </ToastProvider>
  );
}
