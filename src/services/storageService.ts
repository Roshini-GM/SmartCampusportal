import {
  StudentProfile,
  Company,
  PlacementDrive,
  Application,
  Interview,
  Offer,
  NotificationItem,
  Announcement,
  ApplicationStatus,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_COMPANIES,
  INITIAL_DRIVES,
  INITIAL_APPLICATIONS,
  INITIAL_INTERVIEWS,
  INITIAL_OFFERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ANNOUNCEMENTS,
} from '../data/mockData';
import { ApiClient } from './apiClient';

type Listener = () => void;

class StorageService {
  private listeners: Set<Listener> = new Set();
  private isSyncing: boolean = false;

  constructor() {
    this.init();
    this.syncFromBackend();
  }

  private init() {
    if (!localStorage.getItem('smart_campus_students')) {
      localStorage.setItem('smart_campus_students', JSON.stringify(INITIAL_STUDENTS));
    }
    if (!localStorage.getItem('smart_campus_companies')) {
      localStorage.setItem('smart_campus_companies', JSON.stringify(INITIAL_COMPANIES));
    }
    if (!localStorage.getItem('smart_campus_drives')) {
      localStorage.setItem('smart_campus_drives', JSON.stringify(INITIAL_DRIVES));
    }
    if (!localStorage.getItem('smart_campus_applications')) {
      localStorage.setItem('smart_campus_applications', JSON.stringify(INITIAL_APPLICATIONS));
    }
    if (!localStorage.getItem('smart_campus_interviews')) {
      localStorage.setItem('smart_campus_interviews', JSON.stringify(INITIAL_INTERVIEWS));
    }
    if (!localStorage.getItem('smart_campus_offers')) {
      localStorage.setItem('smart_campus_offers', JSON.stringify(INITIAL_OFFERS));
    }
    if (!localStorage.getItem('smart_campus_notifications')) {
      localStorage.setItem('smart_campus_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (!localStorage.getItem('smart_campus_announcements')) {
      localStorage.setItem('smart_campus_announcements', JSON.stringify(INITIAL_ANNOUNCEMENTS));
    }
  }

  public async syncFromBackend(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const [
        studentsRes,
        companiesRes,
        drivesRes,
        appsRes,
        interviewsRes,
        offersRes,
        announcementsRes,
        notificationsRes,
      ] = await Promise.allSettled([
        ApiClient.get<StudentProfile[]>('/students'),
        ApiClient.get<Company[]>('/companies'),
        ApiClient.get<PlacementDrive[]>('/drives'),
        ApiClient.get<Application[]>('/applications'),
        ApiClient.get<Interview[]>('/interviews'),
        ApiClient.get<Offer[]>('/offers'),
        ApiClient.get<Announcement[]>('/announcements'),
        ApiClient.get<NotificationItem[]>('/notifications'),
      ]);

      let hasUpdated = false;

      if (studentsRes.status === 'fulfilled' && studentsRes.value.data?.length) {
        localStorage.setItem('smart_campus_students', JSON.stringify(studentsRes.value.data));
        hasUpdated = true;
      }
      if (companiesRes.status === 'fulfilled' && companiesRes.value.data?.length) {
        localStorage.setItem('smart_campus_companies', JSON.stringify(companiesRes.value.data));
        hasUpdated = true;
      }
      if (drivesRes.status === 'fulfilled' && drivesRes.value.data?.length) {
        localStorage.setItem('smart_campus_drives', JSON.stringify(drivesRes.value.data));
        hasUpdated = true;
      }
      if (appsRes.status === 'fulfilled' && appsRes.value.data?.length) {
        localStorage.setItem('smart_campus_applications', JSON.stringify(appsRes.value.data));
        hasUpdated = true;
      }
      if (interviewsRes.status === 'fulfilled' && interviewsRes.value.data?.length) {
        localStorage.setItem('smart_campus_interviews', JSON.stringify(interviewsRes.value.data));
        hasUpdated = true;
      }
      if (offersRes.status === 'fulfilled' && offersRes.value.data?.length) {
        localStorage.setItem('smart_campus_offers', JSON.stringify(offersRes.value.data));
        hasUpdated = true;
      }
      if (announcementsRes.status === 'fulfilled' && announcementsRes.value.data?.length) {
        localStorage.setItem('smart_campus_announcements', JSON.stringify(announcementsRes.value.data));
        hasUpdated = true;
      }
      if (notificationsRes.status === 'fulfilled' && notificationsRes.value.data?.length) {
        localStorage.setItem('smart_campus_notifications', JSON.stringify(notificationsRes.value.data));
        hasUpdated = true;
      }

      if (hasUpdated) {
        this.notify();
      }
    } catch (e) {
      console.warn('[StorageService] Background sync error:', e);
    } finally {
      this.isSyncing = false;
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error notifying storage listener:', e);
      }
    });
  }

  public resetToDefault() {
    localStorage.setItem('smart_campus_students', JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem('smart_campus_companies', JSON.stringify(INITIAL_COMPANIES));
    localStorage.setItem('smart_campus_drives', JSON.stringify(INITIAL_DRIVES));
    localStorage.setItem('smart_campus_applications', JSON.stringify(INITIAL_APPLICATIONS));
    localStorage.setItem('smart_campus_interviews', JSON.stringify(INITIAL_INTERVIEWS));
    localStorage.setItem('smart_campus_offers', JSON.stringify(INITIAL_OFFERS));
    localStorage.setItem('smart_campus_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem('smart_campus_announcements', JSON.stringify(INITIAL_ANNOUNCEMENTS));
    
    ApiClient.post('/database/seed').catch(() => {});
    this.notify();
  }

  // --- Students ---
  public getStudents(): StudentProfile[] {
    try {
      const data = localStorage.getItem('smart_campus_students');
      return data ? JSON.parse(data) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  }

  public getStudentById(id: string): StudentProfile | undefined {
    return this.getStudents().find((s) => s.id === id || s.userId === id);
  }

  public updateStudentProfile(updated: StudentProfile) {
    const list = this.getStudents();
    const idx = list.findIndex((s) => s.id === updated.id || s.userId === updated.userId);
    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.push(updated);
    }
    localStorage.setItem('smart_campus_students', JSON.stringify(list));
    this.notify();

    ApiClient.put(`/students/${updated.id}`, updated).catch((err) =>
      console.warn('[Storage] Student update persist warning:', err)
    );
  }

  // --- Companies ---
  public getCompanies(): Company[] {
    try {
      const data = localStorage.getItem('smart_campus_companies');
      return data ? JSON.parse(data) : INITIAL_COMPANIES;
    } catch {
      return INITIAL_COMPANIES;
    }
  }

  public addCompany(company: Omit<Company, 'id'> & { id?: string }) {
    const list = this.getCompanies();
    const fullCompany: Company = {
      ...company,
      id: company.id || `comp_${Date.now()}`,
      status: company.status || 'verified',
    };
    list.push(fullCompany);
    localStorage.setItem('smart_campus_companies', JSON.stringify(list));
    this.notify();

    ApiClient.post('/companies', fullCompany).catch((err) =>
      console.warn('[Storage] Company add persist warning:', err)
    );
  }

  public updateCompany(updated: Company) {
    const list = this.getCompanies();
    const idx = list.findIndex((c) => c.id === updated.id);
    if (idx >= 0) {
      list[idx] = updated;
      localStorage.setItem('smart_campus_companies', JSON.stringify(list));
      this.notify();

      ApiClient.put(`/companies/${updated.id}`, updated).catch((err) =>
        console.warn('[Storage] Company update persist warning:', err)
      );
    }
  }

  // --- Drives ---
  public getDrives(): PlacementDrive[] {
    try {
      const data = localStorage.getItem('smart_campus_drives');
      return data ? JSON.parse(data) : INITIAL_DRIVES;
    } catch {
      return INITIAL_DRIVES;
    }
  }

  public addDrive(drive: Omit<PlacementDrive, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) {
    const list = this.getDrives();
    const fullDrive: PlacementDrive = {
      id: drive.id || `drive_${Date.now()}`,
      createdAt: drive.createdAt || new Date().toISOString(),
      ...drive,
    };
    list.push(fullDrive);
    localStorage.setItem('smart_campus_drives', JSON.stringify(list));
    this.notify();

    ApiClient.post('/drives', fullDrive).catch((err) =>
      console.warn('[Storage] Drive add persist warning:', err)
    );
  }

  public updateDrive(updated: PlacementDrive) {
    const list = this.getDrives();
    const idx = list.findIndex((d) => d.id === updated.id);
    if (idx >= 0) {
      list[idx] = updated;
      localStorage.setItem('smart_campus_drives', JSON.stringify(list));
      this.notify();

      ApiClient.put(`/drives/${updated.id}`, updated).catch((err) =>
        console.warn('[Storage] Drive update persist warning:', err)
      );
    }
  }

  public deleteDrive(id: string) {
    const list = this.getDrives().filter((d) => d.id !== id);
    localStorage.setItem('smart_campus_drives', JSON.stringify(list));
    this.notify();

    ApiClient.delete(`/drives/${id}`).catch((err) =>
      console.warn('[Storage] Drive delete persist warning:', err)
    );
  }

  // --- Applications ---
  public getApplications(): Application[] {
    try {
      const data = localStorage.getItem('smart_campus_applications');
      return data ? JSON.parse(data) : INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  }

  public submitApplication(app: Application) {
    const list = this.getApplications();
    list.push(app);
    localStorage.setItem('smart_campus_applications', JSON.stringify(list));
    this.notify();

    ApiClient.post('/applications', app).catch((err) =>
      console.warn('[Storage] Application submit persist warning:', err)
    );
  }

  public applyToDrive(student: StudentProfile, drive: PlacementDrive) {
    const newApp: Application = {
      id: `app_${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      studentRegNo: student.registerNumber,
      studentDept: student.department,
      studentCgpa: student.cgpa,
      driveId: drive.id,
      companyName: drive.companyName,
      companyLogo: drive.companyLogo,
      role: drive.role,
      packageLpa: drive.packageLpa,
      status: 'Applied',
      appliedDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
    };

    this.submitApplication(newApp);

    this.addNotification({
      id: `notif_${Date.now()}`,
      userId: student.userId || student.id,
      title: 'Application Submitted',
      message: `Your application to ${drive.companyName} for ${drive.role} has been submitted.`,
      read: false,
      createdAt: new Date().toISOString(),
      type: 'application',
    });
  }

  public updateApplicationStatus(id: string, status: ApplicationStatus, feedback?: string) {
    const list = this.getApplications();
    const idx = list.findIndex((a) => a.id === id);
    if (idx >= 0) {
      list[idx].status = status;
      list[idx].updatedDate = new Date().toISOString().split('T')[0];
      if (feedback !== undefined) {
        list[idx].feedback = feedback;
      }
      localStorage.setItem('smart_campus_applications', JSON.stringify(list));
      this.notify();

      ApiClient.put(`/applications/${id}/status`, { status, feedback }).catch((err) =>
        console.warn('[Storage] Application status persist warning:', err)
      );
    }
  }

  // --- Interviews ---
  public getInterviews(): Interview[] {
    try {
      const data = localStorage.getItem('smart_campus_interviews');
      return data ? JSON.parse(data) : INITIAL_INTERVIEWS;
    } catch {
      return INITIAL_INTERVIEWS;
    }
  }

  public scheduleInterview(interview: Omit<Interview, 'id'> & { id?: string }) {
    const list = this.getInterviews();
    const fullInterview: Interview = {
      id: interview.id || `int_${Date.now()}`,
      ...interview,
    };
    list.push(fullInterview);
    localStorage.setItem('smart_campus_interviews', JSON.stringify(list));
    this.notify();

    ApiClient.post('/interviews', fullInterview).catch((err) =>
      console.warn('[Storage] Interview schedule persist warning:', err)
    );
  }

  public updateInterview(updated: Interview) {
    const list = this.getInterviews();
    const idx = list.findIndex((i) => i.id === updated.id);
    if (idx >= 0) {
      list[idx] = updated;
      localStorage.setItem('smart_campus_interviews', JSON.stringify(list));
      this.notify();

      ApiClient.put(`/interviews/${updated.id}/status`, updated).catch((err) =>
        console.warn('[Storage] Interview update persist warning:', err)
      );
    }
  }

  // --- Offers ---
  public getOffers(): Offer[] {
    try {
      const data = localStorage.getItem('smart_campus_offers');
      return data ? JSON.parse(data) : INITIAL_OFFERS;
    } catch {
      return INITIAL_OFFERS;
    }
  }

  public createOffer(offer: Offer) {
    const list = this.getOffers();
    list.push(offer);
    localStorage.setItem('smart_campus_offers', JSON.stringify(list));
    this.notify();

    ApiClient.post('/offers', offer).catch((err) =>
      console.warn('[Storage] Offer create persist warning:', err)
    );
  }

  public issueOffer(
    offerData: Omit<Offer, 'id' | 'status' | 'issuedDate'> & {
      id?: string;
      status?: 'Pending' | 'Accepted' | 'Declined';
      issuedDate?: string;
      joiningDate?: string;
    }
  ) {
    const fullOffer: Offer = {
      ...offerData,
      joiningDate: offerData.joiningDate || '2026-07-01',
      letterText: offerData.letterText || `Formal Offer of Employment with ${offerData.companyName}.`,
      id: offerData.id || `off_${Date.now()}`,
      status: offerData.status || 'Pending',
      issuedDate: offerData.issuedDate || new Date().toISOString().split('T')[0],
    };

    this.createOffer(fullOffer);

    this.addNotification({
      id: `notif_${Date.now()}`,
      userId: offerData.studentId,
      title: 'Placement Offer Letter Received!',
      message: `Congratulations! ${offerData.companyName} has issued you an offer letter for the ${offerData.role} position (${offerData.packageLpa} LPA).`,
      read: false,
      createdAt: new Date().toISOString(),
      type: 'offer',
    });
  }

  public updateOfferStatus(id: string, status: 'Pending' | 'Accepted' | 'Declined') {
    const list = this.getOffers();
    const idx = list.findIndex((o) => o.id === id);
    if (idx >= 0) {
      list[idx].status = status;
      if (status === 'Accepted') {
        list[idx].acceptanceDate = new Date().toISOString().split('T')[0];
      }
      localStorage.setItem('smart_campus_offers', JSON.stringify(list));
      this.notify();

      ApiClient.put(`/offers/${id}/status`, { status }).catch((err) =>
        console.warn('[Storage] Offer status persist warning:', err)
      );
    }
  }

  // --- Announcements ---
  public getAnnouncements(): Announcement[] {
    try {
      const data = localStorage.getItem('smart_campus_announcements');
      return data ? JSON.parse(data) : INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  }

  public addAnnouncement(announcement: Omit<Announcement, 'id' | 'date'> & { id?: string; date?: string }) {
    const list = this.getAnnouncements();
    const fullAnnouncement: Announcement = {
      id: announcement.id || `ann_${Date.now()}`,
      date: announcement.date || new Date().toISOString().split('T')[0],
      ...announcement,
    };
    list.unshift(fullAnnouncement);
    localStorage.setItem('smart_campus_announcements', JSON.stringify(list));
    this.notify();

    ApiClient.post('/announcements', fullAnnouncement).catch((err) =>
      console.warn('[Storage] Announcement persist warning:', err)
    );
  }

  // --- Notifications ---
  public getNotifications(): NotificationItem[] {
    try {
      const data = localStorage.getItem('smart_campus_notifications');
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  public addNotification(notification: NotificationItem) {
    const list = this.getNotifications();
    list.unshift(notification);
    localStorage.setItem('smart_campus_notifications', JSON.stringify(list));
    this.notify();

    ApiClient.post('/notifications', notification).catch((err) =>
      console.warn('[Storage] Notification persist warning:', err)
    );
  }

  public markNotificationAsRead(id: string) {
    const list = this.getNotifications();
    const idx = list.findIndex((n) => n.id === id);
    if (idx >= 0) {
      list[idx].read = true;
      localStorage.setItem('smart_campus_notifications', JSON.stringify(list));
      this.notify();

      ApiClient.put(`/notifications/${id}/read`).catch(() => {});
    }
  }

  public markAllNotificationsAsRead(userId: string) {
    const list = this.getNotifications().map((n) => {
      if (n.userId === userId || n.userId === 'all') {
        return { ...n, read: true };
      }
      return n;
    });
    localStorage.setItem('smart_campus_notifications', JSON.stringify(list));
    this.notify();

    ApiClient.put('/notifications/mark-all-read', { userId }).catch(() => {});
  }

  // --- User Profile Synchronizer ---
  public updateUserProfile(
    userId: string,
    updates: {
      name?: string;
      email?: string;
      department?: string;
      registerNumber?: string;
      year?: string;
      cgpa?: number;
      backlogs?: number;
      skills?: string[];
      companyName?: string;
      designation?: string;
      phone?: string;
    },
    role: string
  ) {
    if (role === 'student') {
      const student = this.getStudentById(userId);
      if (student) {
        const updatedStudent: StudentProfile = {
          ...student,
          ...(updates.name && { name: updates.name }),
          ...(updates.email && { email: updates.email }),
          ...(updates.department && { department: updates.department }),
          ...(updates.registerNumber && { registerNumber: updates.registerNumber }),
          ...(updates.year && { year: updates.year }),
          ...(updates.cgpa !== undefined && { cgpa: updates.cgpa }),
          ...(updates.backlogs !== undefined && { backlogs: updates.backlogs }),
          ...(updates.skills && { skills: updates.skills }),
        };
        this.updateStudentProfile(updatedStudent);
      }
    } else if (role === 'recruiter') {
      const companies = this.getCompanies();
      const comp = companies.find((c) => c.userId === userId || c.email === updates.email) || companies[0];
      if (comp) {
        const updatedCompany: Company = {
          ...comp,
          ...(updates.companyName && { name: updates.companyName }),
          ...(updates.name && { contactPerson: updates.name }),
          ...(updates.phone && { contactPhone: updates.phone }),
        };
        this.updateCompany(updatedCompany);
      }
    }
  }
}

export const storageService = new StorageService();
