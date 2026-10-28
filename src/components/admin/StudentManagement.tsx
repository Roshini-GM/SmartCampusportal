import React, { useState } from 'react';
import { StudentProfile } from '../../types';
import { Modal } from '../common/Modal';
import { Search, Filter, Eye, CheckCircle2, UserPlus, GraduationCap, Award } from 'lucide-react';
import { useToast } from '../common/Toast';
import { storageService } from '../../services/storageService';

interface StudentManagementProps {
  students: StudentProfile[];
  onRefreshData: () => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  onRefreshData,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [minCgpaFilter, setMinCgpaFilter] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Placed' | 'Unplaced'>('All');
  const [viewingStudent, setViewingStudent] = useState<StudentProfile | null>(null);

  // New student modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    email: '',
    registerNumber: '',
    department: 'Computer Science',
    year: '4th Year',
    cgpa: 8.0,
    backlogs: 0,
    skills: 'Python, SQL, React',
  });

  const filteredStudents = students.filter((s) => {
    if (selectedDept !== 'All' && s.department !== selectedDept) return false;
    if (s.cgpa < minCgpaFilter) return false;
    if (statusFilter === 'Placed' && !s.placed) return false;
    if (statusFilter === 'Unplaced' && s.placed) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = s.name.toLowerCase().includes(term);
      const matchReg = s.registerNumber.toLowerCase().includes(term);
      const matchSkills = s.skills.some((sk) => sk.toLowerCase().includes(term));
      if (!matchName && !matchReg && !matchSkills) return false;
    }

    return true;
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentData.name || !newStudentData.registerNumber) {
      showToast('Please fill out all required student fields', 'warning');
      return;
    }

    const newStudent: StudentProfile = {
      id: `stud_${Date.now()}`,
      userId: `user_${Date.now()}`,
      name: newStudentData.name,
      email: newStudentData.email,
      registerNumber: newStudentData.registerNumber,
      department: newStudentData.department,
      year: newStudentData.year,
      cgpa: Number(newStudentData.cgpa),
      backlogs: Number(newStudentData.backlogs),
      skills: newStudentData.skills.split(',').map((s) => s.trim()),
      certifications: [],
      projects: [],
      resumeUrl: '#',
      resumeName: `${newStudentData.name.replace(/\s+/g, '_')}_Resume.pdf`,
      placed: false,
    };

    storageService.updateStudentProfile(newStudent);
    showToast(`Student ${newStudent.name} enrolled in placement roster!`, 'success');
    setShowAddModal(false);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Student Directory & Academic Roster</h2>
          <p className="text-xs text-slate-500">
            Monitor student qualifications, verified CGPA marks, arrears, and placement status.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Enroll New Student
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, roll no, skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>
          </div>

          {/* Min CGPA Filter */}
          <div>
            <select
              value={minCgpaFilter}
              onChange={(e) => setMinCgpaFilter(parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white font-mono"
            >
              <option value={0}>All CGPA Ranges</option>
              <option value={7.0}>CGPA ≥ 7.0</option>
              <option value={8.0}>CGPA ≥ 8.0</option>
              <option value={8.5}>CGPA ≥ 8.5 (High Tier)</option>
              <option value={9.0}>CGPA ≥ 9.0 (Top 5%)</option>
            </select>
          </div>

          {/* Placed Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
            >
              <option value="All">All Placement Statuses</option>
              <option value="Placed">Placed Candidates</option>
              <option value="Unplaced">Unplaced (Active Seekers)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-2xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student Name & Roll No</th>
                <th className="py-3 px-4">Department & Class</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Backlogs</th>
                <th className="py-3 px-4">Primary Skills</th>
                <th className="py-3 px-4">Placement Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{s.name}</p>
                    <p className="text-2xs text-slate-400 font-mono">{s.registerNumber}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <p>{s.department}</p>
                    <p className="text-2xs text-slate-400">{s.year}</p>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                    {s.cgpa.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                        s.backlogs === 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {s.backlogs} arrears
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {s.skills.slice(0, 3).map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs"
                        >
                          {sk}
                        </span>
                      ))}
                      {s.skills.length > 3 && (
                        <span className="text-2xs text-slate-400">+{s.skills.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold ${
                        s.placed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {s.placed ? 'Placed' : 'Job Seeker'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setViewingStudent(s)}
                      className="px-2.5 py-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold border border-indigo-200 hover:bg-indigo-50 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Student Details Modal */}
      {viewingStudent && (
        <Modal
          isOpen={!!viewingStudent}
          onClose={() => setViewingStudent(null)}
          title={`Candidate Profile: ${viewingStudent.name}`}
          subtitle={`${viewingStudent.registerNumber} · ${viewingStudent.department}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="text-2xs text-slate-500 uppercase font-semibold">Campus Email</p>
                <p className="font-medium text-slate-900">{viewingStudent.email}</p>
              </div>
              <div>
                <p className="text-2xs text-slate-500 uppercase font-semibold">Academic Year</p>
                <p className="font-medium text-slate-900">{viewingStudent.year}</p>
              </div>
              <div>
                <p className="text-2xs text-slate-500 uppercase font-semibold">Cumulative CGPA</p>
                <p className="font-bold text-indigo-700 font-mono text-sm">
                  {viewingStudent.cgpa.toFixed(2)} / 10.0
                </p>
              </div>
              <div>
                <p className="text-2xs text-slate-500 uppercase font-semibold">Backlog Records</p>
                <p className="font-medium text-slate-900">{viewingStudent.backlogs} standing</p>
              </div>
            </div>

            <div>
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Verified Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {viewingStudent.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-2xs font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Engineering Projects ({viewingStudent.projects?.length || 0})
              </p>
              <div className="space-y-2">
                {(viewingStudent.projects || []).map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded border border-slate-200 bg-white">
                    <p className="font-semibold text-slate-900">{p.title}</p>
                    <p className="text-2xs text-slate-600 mt-0.5">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-2xs text-slate-400">Resume: {viewingStudent.resumeName}</span>
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Enroll Student in Placement Roster"
          maxWidth="md"
        >
          <form onSubmit={handleAddStudent} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={newStudentData.name}
                onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={newStudentData.email}
                onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number *</label>
                <input
                  type="text"
                  required
                  placeholder="22CS199"
                  value={newStudentData.registerNumber}
                  onChange={(e) => setNewStudentData({ ...newStudentData, registerNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={newStudentData.department}
                  onChange={(e) => setNewStudentData({ ...newStudentData, department: e.target.value })}
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CGPA *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newStudentData.cgpa}
                  onChange={(e) => setNewStudentData({ ...newStudentData, cgpa: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Backlogs</label>
                <input
                  type="number"
                  min="0"
                  value={newStudentData.backlogs}
                  onChange={(e) => setNewStudentData({ ...newStudentData, backlogs: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Skills</label>
              <input
                type="text"
                value={newStudentData.skills}
                onChange={(e) => setNewStudentData({ ...newStudentData, skills: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
              >
                Enroll Student
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
