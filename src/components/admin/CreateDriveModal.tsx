import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Company, PlacementDrive, DriveType } from '../../types';
import { storageService } from '../../services/storageService';
import { useToast } from '../common/Toast';
import { Plus, Briefcase } from 'lucide-react';

interface CreateDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  onCreated: () => void;
}

const ALL_DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
];

export const CreateDriveModal: React.FC<CreateDriveModalProps> = ({
  isOpen,
  onClose,
  companies,
  onCreated,
}) => {
  const { showToast } = useToast();
  const [companyId, setCompanyId] = useState(companies[0]?.id || '');
  const [role, setRole] = useState('');
  const [type, setType] = useState<DriveType>('Full-Time');
  const [description, setDescription] = useState('');
  const [packageLpa, setPackageLpa] = useState<number>(12.0);
  const [stipendPerMonth, setStipendPerMonth] = useState<number>(50000);
  const [location, setLocation] = useState('Bangalore / Hyderabad');
  const [skillsInput, setSkillsInput] = useState('Python, SQL, System Design');
  const [minCgpa, setMinCgpa] = useState<number>(7.5);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([
    'Computer Science',
    'Information Technology',
  ]);
  const [graduationYear, setGraduationYear] = useState<number>(2026);
  const [maxBacklogs, setMaxBacklogs] = useState<number>(0);
  const [deadline, setDeadline] = useState('2026-10-31');
  const [driveDate, setDriveDate] = useState('2026-11-08');
  const [roundsInput, setRoundsInput] = useState(
    'Online Coding Challenge, Technical Interview, HR Round'
  );

  const toggleDept = (dept: string) => {
    if (selectedDepts.includes(dept)) {
      setSelectedDepts(selectedDepts.filter((d) => d !== dept));
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  const handleSelectAllDepts = () => {
    if (selectedDepts.length === ALL_DEPARTMENTS.length) {
      setSelectedDepts([]);
    } else {
      setSelectedDepts([...ALL_DEPARTMENTS]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const company = companies.find((c) => c.id === companyId) || companies[0];
    if (!company) {
      showToast('Please select a company', 'warning');
      return;
    }
    if (!role || !description) {
      showToast('Please fill out job role and description', 'warning');
      return;
    }

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const rounds = roundsInput
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    storageService.addDrive({
      companyId: company.id,
      companyName: company.name,
      companyLogo: company.logo,
      role,
      type,
      description,
      packageLpa: Number(packageLpa),
      stipendPerMonth: type.includes('Internship') ? Number(stipendPerMonth) : undefined,
      location,
      requiredSkills: skills,
      minCgpa: Number(minCgpa),
      eligibleDepartments: selectedDepts.length > 0 ? selectedDepts : ['All Branches'],
      graduationYear: Number(graduationYear),
      maxBacklogs: Number(maxBacklogs),
      deadline,
      driveDate,
      rounds: rounds.length > 0 ? rounds : ['Assessment', 'Technical Round', 'HR Round'],
      status: 'active',
    });

    showToast(`Placement drive for ${company.name} created and announced!`, 'success');
    onCreated();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Placement / Internship Drive"
      subtitle="Define role specifications, eligibility parameters, and assessment stages"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recruiting Enterprise *
            </label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Designation / Role *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Graduate Software Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Drive Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DriveType)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
            >
              <option value="Full-Time">Full-Time Career Offer</option>
              <option value="Internship + PPO">Summer Internship + Pre-Placement Offer (PPO)</option>
              <option value="Internship">Semester Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Annual Package CTC (₹ in LPA) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={packageLpa}
              onChange={(e) => setPackageLpa(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono font-bold text-indigo-700"
            />
          </div>

          {type.includes('Internship') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monthly Stipend (₹ / Month)
              </label>
              <input
                type="number"
                value={stipendPerMonth}
                onChange={(e) => setStipendPerMonth(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work Location</label>
            <input
              type="text"
              required
              placeholder="e.g. Bangalore / Pune / Hybrid"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Job Description & Responsibilities *
          </label>
          <textarea
            rows={3}
            required
            placeholder="Outline project domains, responsibilities, engineering stack..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        {/* Eligibility Criteria Sub-section */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Eligibility Parameters (Automated Filter)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-2xs font-semibold text-slate-700 mb-1">
                Minimum CGPA Cutoff
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                required
                value={minCgpa}
                onChange={(e) => setMinCgpa(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-2xs font-semibold text-slate-700 mb-1">
                Graduation Year
              </label>
              <input
                type="number"
                required
                value={graduationYear}
                onChange={(e) => setGraduationYear(parseInt(e.target.value, 10) || 2026)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-2xs font-semibold text-slate-700 mb-1">
                Max Allowed Backlogs / Arrears
              </label>
              <input
                type="number"
                min="0"
                required
                value={maxBacklogs}
                onChange={(e) => setMaxBacklogs(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-2xs font-semibold text-slate-700">Eligible Departments</label>
              <button
                type="button"
                onClick={handleSelectAllDepts}
                className="text-2xs text-indigo-600 hover:underline font-medium"
              >
                {selectedDepts.length === ALL_DEPARTMENTS.length ? 'Clear All' : 'Select All Branches'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_DEPARTMENTS.map((dept) => {
                const isSelected = selectedDepts.includes(dept);
                return (
                  <button
                    type="button"
                    key={dept}
                    onClick={() => toggleDept(dept)}
                    className={`px-2.5 py-1 rounded text-2xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {dept}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Required Technical Competencies (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. C++, Java, Data Structures, System Design"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Interview Evaluation Rounds (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Online Test, Technical Round 1, System Design, HR"
              value={roundsInput}
              onChange={(e) => setRoundsInput(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Application Deadline
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Drive / Assessment Date
            </label>
            <input
              type="date"
              required
              value={driveDate}
              onChange={(e) => setDriveDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Publish Drive to Campus
          </button>
        </div>
      </form>
    </Modal>
  );
};
