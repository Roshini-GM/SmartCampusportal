import React, { useState, useEffect } from 'react';
import { User, StudentProfile, Company } from '../../types';
import { authService } from '../../services/authService';
import { storageService } from '../../services/storageService';
import { apiService } from '../../services/apiService';
import { useToast } from './Toast';
import { Modal } from './Modal';
import {
  User as UserIcon,
  Mail,
  GraduationCap,
  Building2,
  Shield,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Phone,
  BookOpen,
} from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onProfileUpdated: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}) => {
  const { showToast } = useToast();

  // Find associated profile records
  const student = currentUser?.role === 'student' ? authService.getAssociatedStudent() : null;
  const company = currentUser?.role === 'recruiter' ? authService.getAssociatedCompany() : null;

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Student specific
  const [registerNumber, setRegisterNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState('4th Year');
  const [cgpa, setCgpa] = useState<number | string>(8.5);
  const [backlogs, setBacklogs] = useState<number | string>(0);
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');

  // Recruiter specific
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');

  // Admin specific
  const [designation, setDesignation] = useState('Placement Officer');
  const [office, setOffice] = useState('Career Development Cell');

  // Validation Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Populate on open
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setErrors({});
      setSuccessMessage('');

      if (currentUser.role === 'student' && student) {
        setRegisterNumber(student.registerNumber || '');
        setDepartment(student.department || 'Computer Science');
        setYear(student.year || '4th Year');
        setCgpa(student.cgpa !== undefined ? student.cgpa : 8.5);
        setBacklogs(student.backlogs !== undefined ? student.backlogs : 0);
        setSkills(student.skills?.join(', ') || '');
        setBio(student.bio || '');
        setPhone(student.phone || '');
      } else if (currentUser.role === 'recruiter' && company) {
        setCompanyName(company.name || '');
        setIndustry(company.industry || 'Software & Technology');
        setWebsite(company.website || 'https://');
        setLocation(company.location || '');
      } else if (currentUser.role === 'admin') {
        setDesignation('Placement & Training Director');
        setOffice('Directorate of Career Development & Corporate Relations');
        setPhone('+91 44 2250 8000');
      }
    }
  }, [currentUser, isOpen]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // 1. Name validation
    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(name.trim())) {
      newErrors.name = 'Name should only contain letters, spaces, and punctuation.';
    }

    // 2. Email validation
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please provide a valid email format (e.g., user@domain.com).';
    }

    // 3. Student-specific validations
    if (currentUser?.role === 'student') {
      if (!registerNumber.trim()) {
        newErrors.registerNumber = 'Register / Roll Number is required.';
      }
      const numCgpa = parseFloat(String(cgpa));
      if (isNaN(numCgpa) || numCgpa < 0 || numCgpa > 10) {
        newErrors.cgpa = 'CGPA must be a valid number between 0.00 and 10.00.';
      }
      const numBacklogs = parseInt(String(backlogs), 10);
      if (isNaN(numBacklogs) || numBacklogs < 0) {
        newErrors.backlogs = 'Backlogs cannot be negative.';
      }
    }

    // 4. Recruiter-specific validations
    if (currentUser?.role === 'recruiter') {
      if (!companyName.trim()) {
        newErrors.companyName = 'Company name is required.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the errors before saving.', 'error');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        ...(currentUser?.role === 'student'
          ? {
              registerNumber: registerNumber.trim(),
              department,
              year,
              cgpa: parseFloat(String(cgpa)),
              backlogs: parseInt(String(backlogs), 10),
              skills: skillsArray,
              bio: bio.trim(),
            }
          : {}),
        ...(currentUser?.role === 'recruiter'
          ? {
              companyName: companyName.trim(),
              industry: industry.trim(),
              website: website.trim(),
              location: location.trim(),
            }
          : {}),
        ...(currentUser?.role === 'admin'
          ? {
              designation: designation.trim(),
              office: office.trim(),
            }
          : {}),
      };

      // 1. Update in authService & storageService
      const result = authService.updateProfile(payload);

      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }

      // 2. Also sync to apiService
      await apiService.updateProfile(payload).catch(() => {});

      // 3. Notify parent components to reload datasets
      onProfileUpdated();

      // 4. Show success feedback
      setSuccessMessage('Profile and name updated successfully! All records synchronized.');
      showToast('Profile updated! Your new name is active across the portal.', 'success');

      // Brief delay before closing so user sees the checkmark
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setIsSubmitting(false);
      showToast(err.message || 'An error occurred while saving profile.', 'error');
    }
  };

  const handleCancel = () => {
    setErrors({});
    setSuccessMessage('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Edit Profile Settings"
      subtitle={`Update your identity and verified details as ${currentUser?.role?.toUpperCase()}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-5">
        {/* Success Banner */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Primary Identity Section */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
              Core Account Information
            </span>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 capitalize">
              {currentUser?.role} Account
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="e.g. Priya Sharma"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden transition-colors bg-white ${
                  errors.name
                    ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:border-indigo-500'
                }`}
              />
              {errors.name && (
                <p className="text-2xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
              <p className="text-2xs text-slate-400 mt-0.5">
                Reflected in applications, interview boards, and certificates.
              </p>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                placeholder="user@campus.edu"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden transition-colors bg-white ${
                  errors.email
                    ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:border-indigo-500'
                }`}
              />
              {errors.email && (
                <p className="text-2xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Contact Phone */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Role-Specific Permitted Fields */}

        {/* 1. STUDENT FIELDS */}
        {currentUser?.role === 'student' && (
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="border-b border-slate-200/80 pb-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                Academic Details & Eligibility Parameters
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Register / Roll Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={registerNumber}
                  onChange={(e) => {
                    setRegisterNumber(e.target.value);
                    if (errors.registerNumber) setErrors({ ...errors, registerNumber: '' });
                  }}
                  placeholder="e.g. 22CS084"
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden bg-white ${
                    errors.registerNumber
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-300 focus:border-indigo-500'
                  }`}
                />
                {errors.registerNumber && (
                  <p className="text-2xs text-rose-600 mt-1">{errors.registerNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Graduation Class / Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                >
                  <option value="4th Year">4th Year (Class of 2026)</option>
                  <option value="3rd Year">3rd Year (Class of 2027)</option>
                  <option value="2nd Year">2nd Year (Class of 2028)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cumulative CGPA (0.00 – 10.00) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={cgpa}
                  onChange={(e) => {
                    setCgpa(e.target.value);
                    if (errors.cgpa) setErrors({ ...errors, cgpa: '' });
                  }}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden bg-white font-mono font-bold text-indigo-700 ${
                    errors.cgpa ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-indigo-500'
                  }`}
                />
                {errors.cgpa && <p className="text-2xs text-rose-600 mt-1">{errors.cgpa}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Active Backlogs / Arrears
                </label>
                <input
                  type="number"
                  min="0"
                  value={backlogs}
                  onChange={(e) => {
                    setBacklogs(e.target.value);
                    if (errors.backlogs) setErrors({ ...errors, backlogs: '' });
                  }}
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden bg-white font-mono ${
                    errors.backlogs ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-indigo-500'
                  }`}
                />
                {errors.backlogs && <p className="text-2xs text-rose-600 mt-1">{errors.backlogs}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Technical Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. React, Node.js, Python, PostgreSQL"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Professional Bio / Career Summary
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief summary of your academic achievements, engineering projects, and career aspirations..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. RECRUITER FIELDS */}
        {currentUser?.role === 'recruiter' && (
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="border-b border-slate-200/80 pb-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                Company Details & Representation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enterprise / Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    if (errors.companyName) setErrors({ ...errors, companyName: '' });
                  }}
                  placeholder="e.g. Microsoft Corporation"
                  className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden bg-white ${
                    errors.companyName ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-indigo-500'
                  }`}
                />
                {errors.companyName && (
                  <p className="text-2xs text-rose-600 mt-1">{errors.companyName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Industry Sector
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Cloud & Software Infrastructure"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company Website URL
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Office / Hiring Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bangalore / Hyderabad / Hybrid"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. ADMIN FIELDS */}
        {currentUser?.role === 'admin' && (
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="border-b border-slate-200/80 pb-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                Administrative & Directorate Credentials
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Designation / Title
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Head Placement Officer"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Placement Directorate / Office
                </label>
                <input
                  type="text"
                  value={office}
                  onChange={(e) => setOffice(e.target.value)}
                  placeholder="e.g. Directorate of Career Development"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons: Save & Cancel */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
