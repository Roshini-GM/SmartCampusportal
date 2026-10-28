import React, { useState } from 'react';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  ShieldPlus,
  Phone,
  Briefcase,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { authService } from '../../services/authService';
import { useToast } from '../common/Toast';

// -------------------------------------------------------------
// Student Registration Modal (with Password Validation)
// -------------------------------------------------------------
interface StudentRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const StudentRegisterModal: React.FC<StudentRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToLogin,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    registerNumber: '',
    department: 'Computer Science',
    year: '4th Year',
    cgpa: 8.0,
    skills: 'React.js, Node.js, Python, SQL',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.registerNumber.trim()) {
      showToast('Please fill out all mandatory fields', 'warning');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      showToast('Password must be at least 6 characters long', 'warning');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match. Please re-enter.', 'error');
      return;
    }

    const skillsArray = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const result = authService.registerStudent({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      registerNumber: formData.registerNumber,
      department: formData.department,
      year: formData.year,
      cgpa: Number(formData.cgpa),
      skills: skillsArray,
    });

    if (result.success) {
      showToast('Student registration completed! You are now signed in.', 'success');
      onSuccess();
      onClose();
    } else {
      showToast(result.error || 'Registration failed', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Account Registration"
      subtitle="Create your verified campus placement profile and account credentials"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Siddharth Rao"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Email *</label>
            <input
              type="email"
              required
              placeholder="siddharth.rao@campus.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
            />
          </div>

          {/* New User Password Fields */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Register / Roll Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. 22CS142"
              value={formData.registerNumber}
              onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Academic Year</label>
            <select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
            >
              <option value="4th Year">4th Year (Graduating 2026)</option>
              <option value="3rd Year">3rd Year (Pre-Final 2027)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cumulative CGPA (out of 10) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              required
              value={formData.cgpa}
              onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Key Technical Skills (comma separated)</label>
          <input
            type="text"
            placeholder="e.g. React.js, Python, Docker, PostgreSQL, Java"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
            className="text-2xs text-slate-500 hover:text-black cursor-pointer"
          >
            Already have an account? Sign In
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-black hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            Complete Student Registration
          </button>
        </div>
      </form>
    </Modal>
  );
};

// -------------------------------------------------------------
// Recruiter Registration Modal (with Password Validation)
// -------------------------------------------------------------
interface RecruiterRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const RecruiterRegisterModal: React.FC<RecruiterRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToLogin,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    industry: 'Software & Technology',
    website: 'https://',
    location: 'Bangalore / Remote',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.companyName.trim()) {
      showToast('Please fill out all mandatory fields', 'warning');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      showToast('Password must be at least 6 characters long', 'warning');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match. Please re-enter.', 'error');
      return;
    }

    const result = authService.registerRecruiter({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      companyName: formData.companyName,
      website: formData.website,
      location: formData.location,
      industry: formData.industry,
    });

    if (result.success) {
      showToast('Recruiter profile registered successfully!', 'success');
      onSuccess();
      onClose();
    } else {
      showToast(result.error || 'Registration failed', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Corporate Recruiter Partner Registration"
      subtitle="Register your enterprise to post campus hiring drives and evaluate student applicants"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Recruiter Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Maya Chen"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email Address *</label>
            <input
              type="email"
              required
              placeholder="maya.chen@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
            />
          </div>

          {/* New User Password Fields */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Enterprise Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Cisco Systems, Inc."
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Sector</label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
            >
              <option value="Software & Cloud">Software & Cloud Computing</option>
              <option value="Banking & Financial Services">Banking & Financial Services</option>
              <option value="Engineering & Manufacturing">Engineering & Manufacturing</option>
              <option value="Consulting & Analytics">Consulting & Analytics</option>
              <option value="Semiconductors & VLSI">Semiconductors & VLSI</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hiring Location / Office</label>
            <input
              type="text"
              placeholder="e.g. Bangalore / Hyderabad / Hybrid"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
            className="text-2xs text-slate-500 hover:text-black cursor-pointer"
          >
            Already an approved partner? Sign In
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-black hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            Register Employer Profile
          </button>
        </div>
      </form>
    </Modal>
  );
};

// -------------------------------------------------------------
// Admin / Placement Officer Registration Modal
// -------------------------------------------------------------
interface AdminRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const AdminRegisterModal: React.FC<AdminRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToLogin,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    designation: 'Placement Officer',
    office: 'Directorate of Career Development',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Please fill out name and email fields', 'warning');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      showToast('Password must be at least 6 characters long', 'warning');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match. Please re-enter.', 'error');
      return;
    }

    const result = authService.registerAdmin({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      designation: formData.designation,
      office: formData.office,
      phone: formData.phone,
    });

    if (result.success) {
      showToast('New Administrator account created successfully! Signed in.', 'success');
      onSuccess();
      onClose();
    } else {
      showToast(result.error || 'Failed to create admin account', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Placement Officer / Admin"
      subtitle="Provision elevated administrative credentials for career cell operations"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Officer Full Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Dr. Ananya Iyer"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Institutional Email Address *
          </label>
          <input
            type="email"
            required
            placeholder="ananya.iyer@campus.edu"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Password *
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="At least 6 chars"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Designation / Title
            </label>
            <input
              type="text"
              placeholder="e.g. Joint Placement Director"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              placeholder="+91 44 2250 8110"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Directorate / Placement Cell Division
          </label>
          <input
            type="text"
            placeholder="Directorate of Career Development"
            value={formData.office}
            onChange={(e) => setFormData({ ...formData, office: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-black bg-white"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
            className="text-2xs text-slate-500 hover:text-black cursor-pointer"
          >
            Cancel & Return to Login
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldPlus className="w-4 h-4" />
            <span>Create Admin Account</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
