import React, { useState } from 'react';
import { StudentProfile, Certification, StudentProject } from '../../types';
import { storageService } from '../../services/storageService';
import { authService } from '../../services/authService';
import { useToast } from '../common/Toast';
import {
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Award,
  Code2,
  FileText,
  User,
  CheckCircle2,
} from 'lucide-react';

interface StudentProfileViewProps {
  student: StudentProfile;
  onProfileUpdated: () => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  student,
  onProfileUpdated,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<StudentProfile>({ ...student });
  const [skillInput, setSkillInput] = useState('');

  // Cert state
  const [newCert, setNewCert] = useState<Certification>({
    title: '',
    issuer: '',
    year: 2025,
  });

  // Project state
  const [newProject, setNewProject] = useState<StudentProject>({
    title: '',
    description: '',
    techStack: [],
    link: '',
  });
  const [projectTechInput, setProjectTechInput] = useState('');

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    if (formData.skills.includes(skillInput.trim())) {
      showToast('Skill already added', 'warning');
      return;
    }
    setFormData({
      ...formData,
      skills: [...formData.skills, skillInput.trim()],
    });
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleAddCertification = () => {
    if (!newCert.title || !newCert.issuer) {
      showToast('Please enter certification title and issuer', 'warning');
      return;
    }
    setFormData({
      ...formData,
      certifications: [...(formData.certifications || []), { ...newCert }],
    });
    setNewCert({ title: '', issuer: '', year: 2025 });
  };

  const handleRemoveCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, idx) => idx !== index),
    });
  };

  const handleAddProject = () => {
    if (!newProject.title || !newProject.description) {
      showToast('Please enter project title and description', 'warning');
      return;
    }
    const stack = projectTechInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    setFormData({
      ...formData,
      projects: [...(formData.projects || []), { ...newProject, techStack: stack }],
    });
    setNewProject({ title: '', description: '', techStack: [], link: '' });
    setProjectTechInput('');
  };

  const handleRemoveProject = (index: number) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, idx) => idx !== index),
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      showToast('Full name must be at least 2 characters', 'error');
      return;
    }

    // Propagate updated name and academic info to auth and all database records
    authService.updateProfile({
      name: formData.name,
      email: formData.email,
      department: formData.department,
      registerNumber: formData.registerNumber,
      year: formData.year,
      cgpa: formData.cgpa,
      backlogs: formData.backlogs,
      skills: formData.skills,
      bio: formData.bio,
      phone: formData.phone,
    });

    storageService.updateStudentProfile(formData);
    showToast('Academic profile updated! Name changes applied across all records.', 'success');
    onProfileUpdated();
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Student Profile & Academic Record</h2>
          <p className="text-xs text-slate-500">
            Keep your credentials updated to maintain accurate eligibility status for active recruitment drives.
          </p>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Basic Academic Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600" />
          Primary Information & Academic Credentials
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Email</label>
            <input
              type="email"
              disabled
              value={formData.email}
              className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-500 rounded-lg cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Register / Roll Number</label>
            <input
              type="text"
              required
              value={formData.registerNumber}
              onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Class / Year</label>
            <select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
            >
              <option value="4th Year">4th Year (Class of 2026)</option>
              <option value="3rd Year">3rd Year (Class of 2027)</option>
              <option value="2nd Year">2nd Year (Class of 2028)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cumulative CGPA (0.00 – 10.00)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              required
              value={formData.cgpa}
              onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono font-bold text-indigo-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Active Backlogs / Arrears</label>
            <input
              type="number"
              min="0"
              required
              value={formData.backlogs}
              onChange={(e) => setFormData({ ...formData, backlogs: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="text"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Placement Status</label>
            <div className="flex items-center gap-2 pt-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold ${
                  formData.placed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {formData.placed ? 'Placed (Offer Secured)' : 'Active Job Seeker'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Summary / Bio</label>
          <textarea
            rows={2}
            value={formData.bio || ''}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Brief statement highlighting technical passions and career goals..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Skills Management */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-600" />
          Technical & Analytical Skills
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add new skill (e.g. Docker, TypeScript, Microservices)..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill();
              }
            }}
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Skill
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {formData.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-slate-400 hover:text-rose-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Certifications Management */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-600" />
          Certifications & Accreditations
        </h3>

        {/* Existing certs list */}
        <div className="space-y-2">
          {(formData.certifications || []).map((cert, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">{cert.title}</p>
                <p className="text-2xs text-slate-500">
                  {cert.issuer} · Year: {cert.year}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveCertification(idx)}
                className="p-1 text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add new cert row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
          <input
            type="text"
            placeholder="Certification Title (e.g. AWS Cloud Practitioner)"
            value={newCert.title}
            onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
            className="sm:col-span-2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
          />
          <input
            type="text"
            placeholder="Issuer / Authority"
            value={newCert.issuer}
            onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={handleAddCertification}
            className="px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Cert
          </button>
        </div>
      </div>

      {/* Projects Management */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          Technical Projects & GitHub Repositories
        </h3>

        {/* Existing projects list */}
        <div className="space-y-3">
          {(formData.projects || []).map((proj, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border border-slate-200 bg-white space-y-2 relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{proj.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{proj.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600 shrink-0 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {proj.techStack.map((tech, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-2xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                  >
                    {tech}
                  </span>
                ))}
                {proj.link && (
                  <a
                    href={proj.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-2xs text-indigo-600 hover:underline flex items-center gap-0.5 ml-2"
                  >
                    <span>View Project</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Project Form */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
          <p className="text-xs font-semibold text-slate-700">Add New Project</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Project Name"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
            />
            <input
              type="url"
              placeholder="Project / GitHub Link (optional)"
              value={newProject.link || ''}
              onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
            />
          </div>

          <textarea
            rows={2}
            placeholder="Detailed description of features, engineering challenges, architecture..."
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
          />

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Tech stack (comma-separated, e.g. React, Node.js, Redis)"
              value={projectTechInput}
              onChange={(e) => setProjectTechInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
            />
            <button
              type="button"
              onClick={handleAddProject}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Project
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
