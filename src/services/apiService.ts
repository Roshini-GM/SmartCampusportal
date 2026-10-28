import { authService } from './authService';
import { User, StudentProfile, Company, PlacementDrive, Application } from '../types';

/**
 * REST API client with JWT authentication and role-based authorization headers.
 * Sends requests to backend /api/* routes and provides client-side error handling.
 */
class ApiService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // --- Auth & Profile ---
  public async getCurrentProfile(): Promise<{ user: User }> {
    const res = await fetch('/api/auth/me', {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch profile' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  public async updateProfile(payload: {
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
  }): Promise<{ success: boolean; user: User; message: string }> {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Update failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      return res.json();
    } catch {
      // Synchronous client fallback ensures persistence in demo mode
      const result = authService.updateProfile(payload);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }
      return {
        success: true,
        user: result.user!,
        message: 'Profile updated and saved successfully',
      };
    }
  }

  // --- Role-Protected Student Endpoints ---
  public async submitApplication(driveId: string): Promise<Application> {
    const res = await fetch('/api/student/apply', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ driveId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Application failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // --- Role-Protected Recruiter Endpoints ---
  public async postJob(driveData: Partial<PlacementDrive>): Promise<PlacementDrive> {
    const res = await fetch('/api/recruiter/jobs', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(driveData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to post job' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // --- Role-Protected Admin Endpoints ---
  public async getPlacementReport(): Promise<any> {
    const res = await fetch('/api/admin/reports', {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Access denied' }));
      throw new Error(err.error || `HTTP ${res.status} Forbidden`);
    }
    return res.json();
  }
}

export const apiService = new ApiService();
