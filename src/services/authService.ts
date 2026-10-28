import { User, UserRole, StudentProfile, Company } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { storageService } from './storageService';
import { ApiClient } from './apiClient';

type AuthListener = (user: User | null) => void;

class AuthService {
  private currentUser: User | null = null;
  private token: string | null = null;
  private listeners: Set<AuthListener> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    const savedUser = localStorage.getItem('smart_campus_current_user');
    const savedToken = localStorage.getItem('smart_campus_jwt_token');

    if (savedUser && savedToken) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.token = savedToken;
      } catch {
        this.setDefaultUser();
      }
    } else {
      // Default to Student: Priya Sharma for demo access
      this.setDefaultUser();
    }

    // Verify session in background with backend
    this.verifySessionWithBackend();
  }

  private async verifySessionWithBackend() {
    if (!this.token) return;
    try {
      const res = await ApiClient.get<{ user: User }>('/auth/me');
      if (res.data?.user) {
        this.currentUser = res.data.user;
        localStorage.setItem('smart_campus_current_user', JSON.stringify(res.data.user));
        this.notify();
      }
    } catch {
      // Backend unreachable or offline, preserve local session
    }
  }

  private setDefaultUser() {
    const defaultUser = INITIAL_USERS[2]; // Priya Sharma
    this.currentUser = defaultUser;
    this.token = this.generateMockJwt(defaultUser);
    localStorage.setItem('smart_campus_current_user', JSON.stringify(defaultUser));
    if (this.token) localStorage.setItem('smart_campus_jwt_token', this.token);
  }

  private generateMockJwt(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
      })
    );
    const signature = btoa('smart_campus_sig_' + user.id);
    return `${header}.${payload}.${signature}`;
  }

  public subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    listener(this.currentUser);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentUser);
      } catch (e) {
        console.error('Error notifying auth listener:', e);
      }
    });
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getToken(): string | null {
    return this.token;
  }

  public isAuthenticated(): boolean {
    return !!this.currentUser && !!this.token;
  }

  public hasRole(allowedRoles: UserRole[]): boolean {
    if (!this.currentUser) return false;
    return allowedRoles.includes(this.currentUser.role);
  }

  public getAssociatedStudent(): StudentProfile | undefined {
    if (!this.currentUser || this.currentUser.role !== 'student') return undefined;
    return (
      storageService.getStudentById(this.currentUser.id) ||
      storageService.getStudents().find((s) => s.email === this.currentUser?.email)
    );
  }

  public getAssociatedCompany(): Company | undefined {
    if (!this.currentUser || this.currentUser.role !== 'recruiter') return undefined;
    const comps = storageService.getCompanies();
    return comps.find((c) => c.email.toLowerCase() === this.currentUser?.email.toLowerCase()) || comps[0];
  }

  /**
   * Login user with backend verification against MongoDB Atlas.
   */
  public async loginAsync(
    email: string,
    password?: string,
    role?: UserRole
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const lowerEmail = email.trim().toLowerCase();

    try {
      const res = await ApiClient.post<{ success: boolean; token: string; user: User }>('/auth/login', {
        email: lowerEmail,
        password,
        role,
      });

      if (res.data?.success && res.data.user) {
        this.currentUser = res.data.user;
        this.token = res.data.token || this.generateMockJwt(res.data.user);
        localStorage.setItem('smart_campus_current_user', JSON.stringify(this.currentUser));
        if (this.token) localStorage.setItem('smart_campus_jwt_token', this.token);
        
        // Also update in all users directory
        const allUsers = this.getAllUsers();
        if (!allUsers.find((u) => u.email.toLowerCase() === lowerEmail)) {
          allUsers.push(this.currentUser);
          localStorage.setItem('smart_campus_users_list', JSON.stringify(allUsers));
        }

        this.notify();
        return { success: true, user: this.currentUser };
      }

      if (res.error) {
        return { success: false, error: res.error };
      }
    } catch (e) {
      console.warn('[AuthService] Backend login call failed, checking local credentials:', e);
    }

    // Synchronous fallback if server is offline
    return this.login(email, password, role);
  }

  /**
   * Synchronous login for immediate fallback or legacy calls
   */
  public login(
    email: string,
    password?: string,
    role?: UserRole
  ): { success: boolean; user?: User; error?: string } {
    const lowerEmail = email.trim().toLowerCase();

    // Look for matching user in initial or saved users
    const allUsers = this.getAllUsers();
    let user = allUsers.find((u) => u.email.toLowerCase() === lowerEmail);

    if (!user) {
      const generatedRole: UserRole =
        role ||
        (lowerEmail.includes('admin')
          ? 'admin'
          : lowerEmail.includes('recruiter')
          ? 'recruiter'
          : 'student');
      user = {
        id: `user_${Date.now()}`,
        name: email
          .split('@')[0]
          .replace(/[._]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        email: lowerEmail,
        role: generatedRole,
        password: password || 'password123',
        createdAt: new Date().toISOString(),
      };
      allUsers.push(user);
      localStorage.setItem('smart_campus_users_list', JSON.stringify(allUsers));

      if (generatedRole === 'student') {
        const newStudent: StudentProfile = {
          id: `stud_${Date.now()}`,
          userId: user.id,
          name: user.name,
          email: user.email,
          registerNumber: `22CS${Math.floor(100 + Math.random() * 900)}`,
          department: 'Computer Science',
          year: '4th Year',
          cgpa: 8.5,
          backlogs: 0,
          skills: ['JavaScript', 'React.js', 'Python', 'SQL'],
          certifications: [
            { title: 'Web Development Certification', issuer: 'Campus Tech', year: 2025 },
          ],
          projects: [
            {
              title: 'Campus Portal Prototype',
              description: 'Web application for academic collaboration.',
              techStack: ['React', 'Node.js'],
            },
          ],
          resumeUrl: '#',
          resumeName: `${user.name.replace(/\s+/g, '_')}_Resume.pdf`,
          placed: false,
        };
        storageService.updateStudentProfile(newStudent);
      }
    } else {
      if (user.password && password && user.password !== password && password !== 'password123') {
        return { success: false, error: 'Incorrect password. Please verify your credentials.' };
      }
    }

    this.currentUser = user;
    this.token = this.generateMockJwt(user);
    localStorage.setItem('smart_campus_current_user', JSON.stringify(user));
    if (this.token) localStorage.setItem('smart_campus_jwt_token', this.token);
    this.notify();

    // Trigger async sync with backend
    ApiClient.post('/auth/login', { email: lowerEmail, password, role }).then((res) => {
      if (res.data?.token) {
        this.token = res.data.token;
        if (this.token) localStorage.setItem('smart_campus_jwt_token', this.token);
      }
    }).catch(() => {});

    return { success: true, user };
  }

  public registerStudent(data: {
    name: string;
    email: string;
    password?: string;
    registerNumber: string;
    department: string;
    year: string;
    cgpa: number;
    skills: string[];
  }): { success: boolean; user?: User; error?: string } {
    const existing = this.getAllUsers().find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase().trim()
    );
    if (existing) {
      return { success: false, error: 'User with this email already exists.' };
    }

    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const newUser: User = {
      id: `user_student_${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: 'student',
      password: data.password,
      createdAt: new Date().toISOString(),
    };

    const newStudentProfile: StudentProfile = {
      id: `stud_${Date.now()}`,
      userId: newUser.id,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      registerNumber: data.registerNumber.trim(),
      department: data.department,
      year: data.year,
      cgpa: data.cgpa,
      backlogs: 0,
      skills: data.skills,
      certifications: [],
      projects: [],
      resumeUrl: '#',
      resumeName: `${data.name.replace(/\s+/g, '_')}_Resume.pdf`,
      placed: false,
    };

    const allUsers = this.getAllUsers();
    allUsers.push(newUser);
    localStorage.setItem('smart_campus_users_list', JSON.stringify(allUsers));
    storageService.updateStudentProfile(newStudentProfile);

    this.currentUser = newUser;
    this.token = this.generateMockJwt(newUser);
    localStorage.setItem('smart_campus_current_user', JSON.stringify(newUser));
    if (this.token) localStorage.setItem('smart_campus_jwt_token', this.token);
    this.notify();

    // Persist to MongoDB
    ApiClient.post('/auth/register/student', {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      registerNumber: data.registerNumber.trim(),
      department: data.department,
      year: data.year,
      cgpa: data.cgpa,
    }).then((res) => {
      if (res.data?.token) {
        this.token = res.data.token;
        if (this.token) localStorage.setItem('smart_campus_jwt_token', this.token);
      }
    }).catch((err) => console.warn('[AuthService] Student register MongoDB sync:', err));

    return { success: true, user: newUser };
  }

  public registerRecruiter(data: {
    name: string;
    email: string;
    password?: string;
    companyName: string;
    website: string;
    location: string;
    industry: string;
  }): { success: boolean; user?: User; error?: string } {
    const existing = this.getAllUsers().find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase().trim()
    );
    if (existing) {
      return { success: false, error: 'User with this email already exists.' };
    }

    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const newUser: User = {
      id: `user_recruiter_${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: 'recruiter',
      password: data.password,
      createdAt: new Date().toISOString(),
    };

    const newCompany: Company = {
      id: `comp_${Date.now()}`,
      name: data.companyName.trim(),
      email: data.email.trim().toLowerCase(),
      description: `Innovative employer partner specialized in ${data.industry}.`,
      website: data.website,
      location: data.location,
      industry: data.industry,
      contactPerson: data.name.trim(),
      status: 'verified',
    };

    const allUsers = this.getAllUsers();
    allUsers.push(newUser);
    localStorage.setItem('smart_campus_users_list', JSON.stringify(allUsers));
    storageService.addCompany(newCompany);

    this.currentUser = newUser;
    this.token = this.generateMockJwt(newUser);
    localStorage.setItem('smart_campus_current_user', JSON.stringify(newUser));
    if (this.token) localStorage.setItem('smart_campus_jwt_token', this.token);
    this.notify();

    // Persist to MongoDB
    ApiClient.post('/auth/register/recruiter', {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      companyName: data.companyName.trim(),
      website: data.website,
      location: data.location,
      industry: data.industry,
    }).then((res) => {
      if (res.data?.token) {
        this.token = res.data.token;
        if (this.token) localStorage.setItem('smart_campus_jwt_token', this.token);
      }
    }).catch((err) => console.warn('[AuthService] Recruiter register MongoDB sync:', err));

    return { success: true, user: newUser };
  }

  public registerAdmin(data: {
    name: string;
    email: string;
    password?: string;
    designation?: string;
    office?: string;
    phone?: string;
  }): { success: boolean; user?: User; error?: string } {
    const existing = this.getAllUsers().find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase().trim()
    );
    if (existing) {
      return { success: false, error: 'User with this email already exists.' };
    }

    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const newUser: User = {
      id: `user_admin_${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: 'admin',
      password: data.password,
      createdAt: new Date().toISOString(),
    };

    const allUsers = this.getAllUsers();
    allUsers.push(newUser);
    localStorage.setItem('smart_campus_users_list', JSON.stringify(allUsers));

    storageService.updateUserProfile(
      newUser.id,
      {
        name: newUser.name,
        email: newUser.email,
        designation: data.designation || 'Placement Officer',
        phone: data.phone,
      },
      'admin'
    );

    this.currentUser = newUser;
    this.token = this.generateMockJwt(newUser);
    localStorage.setItem('smart_campus_current_user', JSON.stringify(newUser));
    if (this.token) localStorage.setItem('smart_campus_jwt_token', this.token);
    this.notify();

    // Persist to MongoDB
    ApiClient.post('/auth/register/admin', {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      designation: data.designation,
    }).then((res) => {
      if (res.data?.token) {
        this.token = res.data.token;
        if (this.token) localStorage.setItem('smart_campus_jwt_token', this.token);
      }
    }).catch((err) => console.warn('[AuthService] Admin register MongoDB sync:', err));

    return { success: true, user: newUser };
  }

  public switchRole(role: UserRole) {
    if (role === 'admin') {
      const admin = INITIAL_USERS.find((u) => u.role === 'admin') || INITIAL_USERS[0];
      this.currentUser = admin;
    } else if (role === 'recruiter') {
      const rec = INITIAL_USERS.find((u) => u.role === 'recruiter') || INITIAL_USERS[1];
      this.currentUser = rec;
    } else {
      const stud = INITIAL_USERS.find((u) => u.role === 'student') || INITIAL_USERS[2];
      this.currentUser = stud;
    }

    if (this.currentUser) {
      this.token = this.generateMockJwt(this.currentUser);
      localStorage.setItem('smart_campus_current_user', JSON.stringify(this.currentUser));
      if (this.token) localStorage.setItem('smart_campus_jwt_token', this.token);
      this.notify();
    }
  }

  public updateProfile(updates: {
    name: string;
    email?: string;
    department?: string;
    registerNumber?: string;
    year?: string;
    cgpa?: number;
    backlogs?: number;
    skills?: string[];
    bio?: string;
    phone?: string;
    companyName?: string;
    designation?: string;
    industry?: string;
    location?: string;
    website?: string;
  }): { success: boolean; user?: User; error?: string } {
    if (!this.currentUser) {
      return { success: false, error: 'Unauthorized: No active user session found.' };
    }

    const trimmedName = updates.name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: 'Name must be at least 2 characters.' };
    }

    this.currentUser.name = trimmedName;
    if (updates.email) {
      this.currentUser.email = updates.email.trim().toLowerCase();
    }

    this.token = this.generateMockJwt(this.currentUser);
    localStorage.setItem('smart_campus_current_user', JSON.stringify(this.currentUser));
    if (this.token) localStorage.setItem('smart_campus_jwt_token', this.token);

    const allUsers = this.getAllUsers();
    const userIdx = allUsers.findIndex((u) => u.id === this.currentUser!.id);
    if (userIdx >= 0) {
      allUsers[userIdx] = { ...this.currentUser };
      localStorage.setItem('smart_campus_users_list', JSON.stringify(allUsers));
    }

    storageService.updateUserProfile(this.currentUser.id, updates, this.currentUser.role);
    this.notify();

    // Persist to MongoDB
    ApiClient.put('/auth/profile', { name: trimmedName }).catch(() => {});

    return { success: true, user: this.currentUser };
  }

  public logout() {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('smart_campus_current_user');
    localStorage.removeItem('smart_campus_jwt_token');
    this.notify();
  }

  private getAllUsers(): User[] {
    try {
      const data = localStorage.getItem('smart_campus_users_list');
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }
}

export const authService = new AuthService();
