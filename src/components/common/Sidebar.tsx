import React from 'react';
import {
  LayoutDashboard,
  User as UserIcon,
  FileText,
  Briefcase,
  GraduationCap,
  Calendar,
  Award,
  BellRing,
  Settings,
  Users,
  Building,
  CheckSquare,
  FileCheck2,
  TrendingUp,
  PlusCircle,
  Clock,
  CheckCircle2,
  LogOut,
  Edit3,
  ExternalLink,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { UserRole, User } from '../../types';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  unreadCount?: number;
  offersCount?: number;
  currentUser: User | null;
  onOpenEditProfile: () => void;
  onNavigateHome: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  unreadCount = 0,
  offersCount = 0,
  currentUser,
  onOpenEditProfile,
  onNavigateHome,
  onLogout,
}) => {
  const getNavItems = () => {
    switch (role) {
      case 'student':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'profile', label: 'My Profile', icon: UserIcon },
          { id: 'resume', label: 'Resume & Documents', icon: FileText },
          { id: 'drives', label: 'Placement Drives', icon: Briefcase },
          { id: 'internships', label: 'Internships', icon: GraduationCap },
          { id: 'applications', label: 'My Applications', icon: CheckSquare },
          { id: 'interviews', label: 'Interview Schedule', icon: Calendar },
          { id: 'offers', label: 'Job Offers', icon: Award, badge: offersCount > 0 ? `${offersCount}` : undefined },
          { id: 'notifications', label: 'Notifications', icon: BellRing, badge: unreadCount > 0 ? `${unreadCount}` : undefined },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
          { id: 'students', label: 'Students Directory', icon: Users },
          { id: 'companies', label: 'Partner Companies', icon: Building },
          { id: 'drives', label: 'Placement Drives', icon: Briefcase },
          { id: 'applications', label: 'All Applications', icon: FileCheck2 },
          { id: 'shortlisted', label: 'Shortlisted Pool', icon: CheckSquare },
          { id: 'interviews', label: 'Interviews & Schedules', icon: Calendar },
          { id: 'results', label: 'Placement Results', icon: CheckCircle2 },
          { id: 'offers', label: 'Offer Letters', icon: Award },
          { id: 'announcements', label: 'Announcements', icon: BellRing },
          { id: 'reports', label: 'Reports & Analytics', icon: TrendingUp },
          { id: 'settings', label: 'Portal Configuration', icon: Settings },
        ];
      case 'recruiter':
        return [
          { id: 'dashboard', label: 'Recruiter Dashboard', icon: LayoutDashboard },
          { id: 'company_profile', label: 'Company Profile', icon: Building },
          { id: 'post_job', label: 'Post Job / Drive', icon: PlusCircle },
          { id: 'manage_jobs', label: 'Manage Postings', icon: Briefcase },
          { id: 'applicants', label: 'Applicants Review', icon: Users },
          { id: 'shortlisted', label: 'Shortlisted Candidates', icon: CheckSquare },
          { id: 'interviews', label: 'Interview Schedules', icon: Calendar },
          { id: 'selected', label: 'Selected & Offers', icon: Award },
        ];
    }
  };

  const navItems = getNavItems();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FCFCFB] border-r border-[#E7E7E4] w-64 select-none">
      {/* Top Brand Header in Sidebar */}
      <div className="p-4 border-b border-[#E7E7E4] bg-white">
        <div className="flex items-center gap-2.5 text-left">
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-2xs">
            SC
          </div>
          <div>
            <p className="text-xs font-bold tracking-tight text-slate-900">
              Smart Campus
            </p>
            <p className="text-2xs text-slate-400 font-medium">Placement Portal</p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-black text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#F3F2EF]'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-2xs font-semibold ${
                    isActive
                      ? 'bg-white text-black'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Card & Edit Profile Button at Bottom */}
      <div className="p-3 border-t border-[#E7E7E4] bg-[#F7F7F5]">
        <div className="p-2.5 bg-white rounded-xl border border-[#E7E7E4] shadow-2xs space-y-2.5">
          {/* User info row */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate" title={currentUser?.name}>
                {currentUser?.name || 'Verified User'}
              </p>
              <p className="text-2xs text-slate-500 truncate" title={currentUser?.email}>
                {currentUser?.email || 'user@campus.edu'}
              </p>
            </div>
          </div>

          {/* Action Buttons: Edit Profile & Logout */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
            <button
              onClick={onOpenEditProfile}
              className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-[#F3F2EF] hover:bg-slate-200 text-slate-800 rounded-lg text-2xs font-semibold transition-colors cursor-pointer"
              title="Edit Profile Information"
            >
              <Edit3 className="w-3 h-3 text-slate-600" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Log Out of Session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Academic Year indicator */}
        <div className="mt-2 text-center">
          <span className="text-2xs text-slate-400 font-mono">Session 2025–2026 · v2.4</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sticky sidebar starting top-0 */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 max-w-xs">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
