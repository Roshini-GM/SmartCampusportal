import React, { useState } from 'react';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  ShieldPlus,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { useToast } from '../common/Toast';
import { UserRole } from '../../types';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
  onOpenStudentRegister: () => void;
  onOpenRecruiterRegister: () => void;
  onOpenAdminRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onOpenStudentRegister,
  onOpenRecruiterRegister,
  onOpenAdminRegister,
}) => {
  const { showToast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter your registered email address', 'error');
      return;
    }
    if (!password) {
      showToast('Please enter your password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.loginAsync(email.trim(), password, selectedRole);
      setIsLoading(false);

      if (result.success && result.user) {
        showToast(`Welcome back, ${result.user.name}!`, 'success');
        onLoginSuccess(result.user.role);
      } else {
        showToast(result.error || 'Authentication failed. Please check credentials.', 'error');
      }
    } catch {
      setIsLoading(false);
      showToast('Login attempt failed. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col justify-center items-center p-4 sm:p-6 relative select-none">
      {/* Subtle background ambient glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Container */}
      <div className="w-full max-w-md bg-[#FCFCFB] rounded-2xl sm:rounded-3xl border border-[#E7E7E4] p-6 sm:p-8 shadow-sm relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center font-bold text-lg shadow-sm mb-3">
            SC
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Smart Campus Placement
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Recruitment & Career Management Portal
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="mb-6">
          <p className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
            Select Portal Access Role
          </p>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F3F2EF] rounded-xl border border-[#E7E7E4]">
            <button
              type="button"
              onClick={() => handleRoleSelect('student')}
              className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedRole === 'student'
                  ? 'bg-white text-black shadow-2xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-white text-black shadow-2xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('recruiter')}
              className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedRole === 'recruiter'
                  ? 'bg-white text-black shadow-2xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Recruiter</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {selectedRole === 'student'
                ? 'Campus Student Email'
                : selectedRole === 'admin'
                ? 'Officer / Directorate Email'
                : 'Corporate Email'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  selectedRole === 'student'
                    ? 'student@campus.edu'
                    : selectedRole === 'admin'
                    ? 'admin@campus.edu'
                    : 'recruiter@company.com'
                }
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E7E4] rounded-xl focus:outline-hidden focus:border-black bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#E7E7E4] rounded-xl focus:outline-hidden focus:border-black bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-black hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{isLoading ? 'Signing In...' : `Sign In to Portal`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Registration and New Admin Options */}
        <div className="pt-5 mt-5 border-t border-[#E7E7E4] flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-2xs text-slate-500 text-center">
          <button
            type="button"
            onClick={onOpenStudentRegister}
            className="hover:text-black font-medium transition-colors cursor-pointer"
          >
            Register as Student
          </button>
          <span className="text-slate-300">·</span>
          <button
            type="button"
            onClick={onOpenRecruiterRegister}
            className="hover:text-black font-medium transition-colors cursor-pointer"
          >
            Register as Recruiter
          </button>
          <span className="text-slate-300">·</span>
          <button
            type="button"
            onClick={onOpenAdminRegister}
            className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <ShieldPlus className="w-3 h-3" />
            Create New Admin
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-2xs text-slate-400">
        <p>© {new Date().getFullYear()} Smart Campus Recruitment & Placement Portal</p>
        <p className="mt-0.5">Secure Role-Based Access Control</p>
      </div>
    </div>
  );
};
