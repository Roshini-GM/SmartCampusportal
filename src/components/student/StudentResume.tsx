import React, { useState } from 'react';
import { StudentProfile } from '../../types';
import { storageService } from '../../services/storageService';
import { useToast } from '../common/Toast';
import {
  FileText,
  Upload,
  CheckCircle2,
  Download,
  AlertCircle,
  Eye,
  Check,
  Sparkles,
} from 'lucide-react';

interface StudentResumeProps {
  student: StudentProfile;
  onUpdated: () => void;
}

export const StudentResume: React.FC<StudentResumeProps> = ({ student, onUpdated }) => {
  const { showToast } = useToast();
  const [fileName, setFileName] = useState(student.resumeName || 'My_Verified_Resume.pdf');
  const [isUploading, setIsUploading] = useState(false);

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      setTimeout(() => {
        setFileName(file.name);
        storageService.updateStudentProfile({
          ...student,
          resumeName: file.name,
        });
        setIsUploading(false);
        showToast(`Resume "${file.name}" uploaded and submitted to verification queue!`, 'success');
        onUpdated();
      }, 700);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Resume & Credentials Repository</h2>
          <p className="text-xs text-slate-500">
            Recruiters and hiring managers review this document during candidate screening rounds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Uploading...' : 'Upload New Version'}</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleSimulateUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Resume Card */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-start justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0">
                PDF
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{fileName}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Size: 248 KB · Last modified: Sept 2026 · Format: Standard 1-Page Academic
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified by Placement Cell
                  </span>
                  <span className="text-2xs text-slate-400">·</span>
                  <span className="text-2xs text-slate-500">Visible to Approved Recruiters</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => showToast('Downloading verified student resume PDF...', 'info')}
              className="px-3 py-1.5 border border-slate-300 hover:bg-white text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>

          {/* Interactive Document Preview Box */}
          <div className="border border-slate-200 rounded-xl p-8 bg-slate-50/30 text-slate-800 space-y-6 shadow-inner font-sans">
            <div className="border-b border-slate-200 pb-4 text-center">
              <h3 className="text-xl font-bold uppercase tracking-wide text-slate-900">
                {student.name}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {student.department} · Register: {student.registerNumber} · {student.email} · {student.phone || '+91 98765 43210'}
              </p>
              <p className="text-2xs text-indigo-700 mt-0.5">
                LinkedIn: {student.linkedinUrl || 'linkedin.com/in/priya-sharma'} · GitHub: {student.githubUrl || 'github.com/priyasharma'}
              </p>
            </div>

            {/* Education */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Education
              </h4>
              <div className="flex justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900">Bachelor of Engineering ({student.department})</p>
                  <p className="text-slate-600 text-2xs">Smart Campus Institute of Technology</p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-mono font-bold text-indigo-700">CGPA: {student.cgpa.toFixed(2)} / 10.0</p>
                  <p className="text-slate-500 text-2xs">{student.year} · No Active Backlogs</p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Technical Proficiencies
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                <strong>Core Stack:</strong> {student.skills.join(', ')}
              </p>
            </div>

            {/* Projects */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Featured Engineering Projects
              </h4>
              {student.projects.map((proj, idx) => (
                <div key={idx} className="text-xs">
                  <p className="font-semibold text-slate-900">{proj.title}</p>
                  <p className="text-slate-600 text-2xs mt-0.5">{proj.description}</p>
                  <p className="text-2xs text-indigo-600 font-mono mt-0.5">
                    Technologies: {proj.techStack.join(', ')}
                  </p>
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Industry Certifications
              </h4>
              {student.certifications.map((c, idx) => (
                <p key={idx} className="text-xs text-slate-700">
                  • <strong>{c.title}</strong> — {c.issuer} ({c.year})
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: ATS & Placement Cell Guidelines */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>ATS Readiness Checklist</span>
            </div>
            <p className="text-xs text-slate-600">
              Your resume follows standard corporate formatting recommendations:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-emerald-800 bg-emerald-50 p-2 rounded">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Single-page format optimized for automated applicant tracking systems (ATS).</span>
              </div>
              <div className="flex items-start gap-2 text-emerald-800 bg-emerald-50 p-2 rounded">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Standard sans-serif font rendering with crisp tabular typography.</span>
              </div>
              <div className="flex items-start gap-2 text-emerald-800 bg-emerald-50 p-2 rounded">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Clean project outcomes with quantified technical metrics.</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-5 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Placement Cell Regulations</span>
            </div>
            <p className="text-2xs text-amber-800 leading-relaxed">
              Resumes uploaded to the portal must contain truthful CGPA marks and active backlog counts. Discrepancies between official university marks cards and the uploaded resume may lead to disqualification from subsequent campus drives.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
