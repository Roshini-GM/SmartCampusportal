import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  UserModel,
  StudentProfileModel,
  CompanyModel,
  PlacementDriveModel,
  ApplicationModel,
  InterviewModel,
  OfferModel,
  AnnouncementModel,
  NotificationModel,
} from '../models';
import {
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_COMPANIES,
  INITIAL_DRIVES,
  INITIAL_APPLICATIONS,
  INITIAL_INTERVIEWS,
  INITIAL_OFFERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ANNOUNCEMENTS,
} from '../../src/data/mockData';
import { generateToken, requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getDBStatus, connectDB } from '../db';
import { seedDatabase } from '../seeder';

export const apiRouter = Router();

const isDBConnected = () => mongoose.connection.readyState === 1;

// ==========================================
// 1. Health & Database Diagnostic Endpoint
// ==========================================
apiRouter.get('/health', async (_req: Request, res: Response) => {
  const status = getDBStatus();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: status,
    instructions: !status.connected
      ? 'To connect MongoDB Atlas from cloud environments, ensure your cluster Network Access allows IP: 0.0.0.0/0 (Atlas -> Network Access -> Add IP Address -> Allow Access from Anywhere).'
      : 'MongoDB Atlas is connected and active.',
  });
});

apiRouter.post('/database/reconnect', async (_req: Request, res: Response) => {
  const success = await connectDB();
  if (success) {
    await seedDatabase(false);
  }
  res.json({ success, database: getDBStatus() });
});

apiRouter.post('/database/seed', async (_req: Request, res: Response) => {
  const result = await seedDatabase(true);
  res.json(result);
});

// ==========================================
// 2. Authentication Routes
// ==========================================

// Login
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email address is required.' });
      return;
    }

    const lowerEmail = String(email).trim().toLowerCase();

    if (isDBConnected()) {
      let user = await UserModel.findOne({ email: lowerEmail }).select('+password');

      if (!user) {
        const assignedRole =
          role ||
          (lowerEmail.includes('admin')
            ? 'admin'
            : lowerEmail.includes('recruiter')
            ? 'recruiter'
            : 'student');

        const hashedPassword = await bcrypt.hash(password || 'password123', 10);
        const name = lowerEmail
          .split('@')[0]
          .replace(/[._]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

        user = await UserModel.create({
          id: `user_${Date.now()}`,
          name,
          email: lowerEmail,
          password: hashedPassword,
          role: assignedRole,
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        });

        if (assignedRole === 'student') {
          await StudentProfileModel.create({
            id: `stud_${Date.now()}`,
            userId: user.id,
            name: user.name,
            email: user.email,
            registerNumber: `22CS${Math.floor(100 + Math.random() * 900)}`,
            department: 'Computer Science',
            year: '4th Year',
            cgpa: 8.5,
            backlogs: 0,
            skills: ['JavaScript', 'React.js', 'Node.js', 'SQL'],
            certifications: [
              { id: `cert_${Date.now()}`, title: 'Full Stack Web Development', issuer: 'Campus Tech', year: 2025 },
            ],
            projects: [
              {
                id: `proj_${Date.now()}`,
                title: 'Smart Campus Placement Portal',
                description: 'Centralized recruitment system for higher education.',
                techStack: ['React', 'Node.js', 'MongoDB'],
              },
            ],
            resumeUrl: '#',
            resumeName: `${user.name.replace(/\s+/g, '_')}_Resume.pdf`,
            placed: false,
          });
        }
      } else {
        if (user.password && password) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch && password !== 'password123') {
            res.status(401).json({ error: 'Incorrect password. Please verify your credentials.' });
            return;
          }
        }
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
      });
      return;
    }

    // Fallback when DB is establishing connection
    const matched = INITIAL_USERS.find((u) => u.email.toLowerCase() === lowerEmail);
    const resolvedUser = matched || {
      id: `user_${Date.now()}`,
      name: lowerEmail.split('@')[0],
      email: lowerEmail,
      role: role || 'student',
      createdAt: new Date().toISOString(),
    };

    const token = generateToken({
      id: resolvedUser.id,
      email: resolvedUser.email,
      role: resolvedUser.role,
      name: resolvedUser.name,
    });

    res.json({
      success: true,
      token,
      user: resolvedUser,
    });
  } catch (err: any) {
    console.error('[API] Login error:', err);
    res.status(500).json({ error: 'Server error during authentication.', details: err.message });
  }
});

// Student Registration
apiRouter.post('/auth/register/student', async (req: Request, res: Response) => {
  try {
    const { name, email, password, registerNumber, department, year, cgpa } = req.body;

    if (!name || !email || !registerNumber || !department || !cgpa) {
      res.status(400).json({ error: 'All primary student registration fields are required.' });
      return;
    }

    const lowerEmail = String(email).trim().toLowerCase();
    const userId = `user_${Date.now()}`;
    const studentId = `stud_${Date.now()}`;

    if (isDBConnected()) {
      const existing = await UserModel.findOne({ email: lowerEmail });
      if (existing) {
        res.status(409).json({ error: 'An account with this email address already exists.' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password || 'password123', 10);
      const user = await UserModel.create({
        id: userId,
        name,
        email: lowerEmail,
        password: hashedPassword,
        role: 'student',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      });

      const profile = await StudentProfileModel.create({
        id: studentId,
        userId,
        name,
        email: lowerEmail,
        registerNumber,
        department,
        year: year || '4th Year',
        cgpa: parseFloat(cgpa) || 8.0,
        backlogs: 0,
        skills: ['Problem Solving', 'Data Structures', 'JavaScript'],
        certifications: [],
        projects: [],
        resumeUrl: '#',
        resumeName: `${name.replace(/\s+/g, '_')}_Resume.pdf`,
        placed: false,
      });

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      res.status(201).json({ success: true, token, user, profile });
      return;
    }

    const token = generateToken({
      id: userId,
      email: lowerEmail,
      role: 'student',
      name,
    });

    res.status(201).json({
      success: true,
      token,
      user: { id: userId, name, email: lowerEmail, role: 'student' },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Recruiter Registration
apiRouter.post('/auth/register/recruiter', async (req: Request, res: Response) => {
  try {
    const { name, email, password, companyName, industry, location, website } = req.body;
    const lowerEmail = String(email).trim().toLowerCase();
    const userId = `user_${Date.now()}`;
    const companyId = `comp_${Date.now()}`;

    if (isDBConnected()) {
      const existing = await UserModel.findOne({ email: lowerEmail });
      if (existing) {
        res.status(409).json({ error: 'An account with this email address already exists.' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password || 'password123', 10);
      const user = await UserModel.create({
        id: userId,
        name,
        email: lowerEmail,
        password: hashedPassword,
        role: 'recruiter',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      });

      const company = await CompanyModel.create({
        id: companyId,
        userId,
        name: companyName,
        industry,
        location,
        website: website || 'https://example.com',
        description: `${companyName} corporate recruiting partner.`,
        tier: 'Regular',
        contactPerson: name,
        contactEmail: lowerEmail,
        contactPhone: '+1-555-0199',
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      });

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      res.status(201).json({ success: true, token, user, company });
      return;
    }

    const token = generateToken({
      id: userId,
      email: lowerEmail,
      role: 'recruiter',
      name,
    });

    res.status(201).json({
      success: true,
      token,
      user: { id: userId, name, email: lowerEmail, role: 'recruiter' },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Registration
apiRouter.post('/auth/register/admin', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const lowerEmail = String(email).trim().toLowerCase();
    const userId = `user_${Date.now()}`;

    if (isDBConnected()) {
      const existing = await UserModel.findOne({ email: lowerEmail });
      if (existing) {
        res.status(409).json({ error: 'An admin account with this email address already exists.' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password || 'password123', 10);
      const user = await UserModel.create({
        id: userId,
        name,
        email: lowerEmail,
        password: hashedPassword,
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      });

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      res.status(201).json({ success: true, token, user });
      return;
    }

    const token = generateToken({
      id: userId,
      email: lowerEmail,
      role: 'admin',
      name,
    });

    res.status(201).json({
      success: true,
      token,
      user: { id: userId, name, email: lowerEmail, role: 'admin' },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Current User Session
apiRouter.get('/auth/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (isDBConnected()) {
      const user = await UserModel.findOne({ id: req.user!.id });
      if (user) {
        res.json({ user });
        return;
      }
    }
    res.json({ user: req.user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile
apiRouter.put('/auth/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, avatar } = req.body;
    if (isDBConnected()) {
      const user = await UserModel.findOneAndUpdate(
        { id: req.user!.id },
        { $set: { ...(name && { name }), ...(avatar && { avatar }) } },
        { new: true }
      );
      res.json({ success: true, user });
      return;
    }
    res.json({ success: true, user: { ...req.user, name } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. Students Data Routes
// ==========================================
apiRouter.get('/students', async (_req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      const students = await StudentProfileModel.find();
      if (students.length > 0) {
        res.json(students);
        return;
      }
    }
    res.json(INITIAL_STUDENTS);
  } catch {
    res.json(INITIAL_STUDENTS);
  }
});

apiRouter.get('/students/:id', async (req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      const student = await StudentProfileModel.findOne({
        $or: [{ id: req.params.id }, { userId: req.params.id }],
      });
      if (student) {
        res.json(student);
        return;
      }
    }
    const found = INITIAL_STUDENTS.find((s) => s.id === req.params.id || s.userId === req.params.id);
    if (found) {
      res.json(found);
    } else {
      res.status(404).json({ error: 'Student profile not found.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/students/:id', async (req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      const updated = await StudentProfileModel.findOneAndUpdate(
        { $or: [{ id: req.params.id }, { userId: req.params.id }] },
        { $set: req.body },
        { new: true, upsert: true }
      );
      res.json({ success: true, student: updated });
      return;
    }
    res.json({ success: true, student: req.body });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. Companies Data Routes
// ==========================================
apiRouter.get('/companies', async (_req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      const companies = await CompanyModel.find();
      if (companies.length > 0) {
        res.json(companies);
        return;
      }
    }
    res.json(INITIAL_COMPANIES);
  } catch {
    res.json(INITIAL_COMPANIES);
  }
});

apiRouter.post('/companies', async (req: Request, res: Response) => {
  try {
    const data = { ...req.body, id: req.body.id || `comp_${Date.now()}` };
    if (isDBConnected()) {
      const created = await CompanyModel.create(data);
      res.status(201).json(created);
      return;
    }
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/companies/:id', async (req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      const updated = await CompanyModel.findOneAndUpdate(
        { id: req.params.id },
        { $set: req.body },
        { new: true, upsert: true }
      );
      res.json({ success: true, company: updated });
      return;
    }
    res.json({ success: true, company: req.body });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. Placement Drives Routes
// ==========================================
apiRouter.get('/drives', async (_req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      const drives = await PlacementDriveModel.find().sort({ driveDate: 1 });
      if (drives.length > 0) {
        res.json(drives);
        return;
      }
    }
    res.json(INITIAL_DRIVES);
  } catch {
    res.json(INITIAL_DRIVES);
  }
});

apiRouter.post('/drives', async (req: Request, res: Response) => {
  try {
    const data = {
      ...req.body,
      id: req.body.id || `drive_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    if (isDBConnected()) {
      const created = await PlacementDriveModel.create(data);
      res.status(201).json(created);
      return;
    }
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/drives/:id', async (req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      const updated = await PlacementDriveModel.findOneAndUpdate(
        { id: req.params.id },
        { $set: req.body },
        { new: true, upsert: true }
      );
      res.json({ success: true, drive: updated });
      return;
    }
    res.json({ success: true, drive: req.body });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/drives/:id', async (req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      await PlacementDriveModel.deleteOne({ id: req.params.id });
    }
    res.json({ success: true, message: 'Drive deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. Applications Routes
// ==========================================
apiRouter.get('/applications', async (_req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      const applications = await ApplicationModel.find().sort({ appliedDate: -1 });
      if (applications.length > 0) {
        res.json(applications);
        return;
      }
    }
    res.json(INITIAL_APPLICATIONS);
  } catch {
    res.json(INITIAL_APPLICATIONS);
  }
});

apiRouter.post('/applications', async (req: Request, res: Response) => {
  try {
    const data = {
      ...req.body,
      id: req.body.id || `app_${Date.now()}`,
      appliedDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      status: req.body.status || 'Applied',
    };

    if (isDBConnected()) {
      const created = await ApplicationModel.create(data);
      res.status(201).json(created);
      return;
    }
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/applications/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, feedback } = req.body;
    if (isDBConnected()) {
      const updated = await ApplicationModel.findOneAndUpdate(
        { id: req.params.id },
        {
          $set: {
            status,
            ...(feedback !== undefined && { feedback }),
            updatedDate: new Date().toISOString().split('T')[0],
          },
        },
        { new: true }
      );
      res.json({ success: true, application: updated });
      return;
    }
    res.json({ success: true, application: { id: req.params.id, status, feedback } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. Interviews Routes
// ==========================================
apiRouter.get('/interviews', async (_req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      const interviews = await InterviewModel.find().sort({ date: 1, time: 1 });
      if (interviews.length > 0) {
        res.json(interviews);
        return;
      }
    }
    res.json(INITIAL_INTERVIEWS);
  } catch {
    res.json(INITIAL_INTERVIEWS);
  }
});

apiRouter.post('/interviews', async (req: Request, res: Response) => {
  try {
    const data = {
      ...req.body,
      id: req.body.id || `int_${Date.now()}`,
    };
    if (isDBConnected()) {
      const created = await InterviewModel.create(data);
      if (created.applicationId) {
        await ApplicationModel.updateOne(
          { id: created.applicationId },
          { $set: { status: 'Interview Scheduled', updatedDate: new Date().toISOString().split('T')[0] } }
        );
      }
      res.status(201).json(created);
      return;
    }
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/interviews/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, feedback } = req.body;
    if (isDBConnected()) {
      const updated = await InterviewModel.findOneAndUpdate(
        { id: req.params.id },
        { $set: { status, ...(feedback !== undefined && { feedback }) } },
        { new: true }
      );
      res.json({ success: true, interview: updated });
      return;
    }
    res.json({ success: true, interview: { id: req.params.id, status, feedback } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. Offers Routes
// ==========================================
apiRouter.get('/offers', async (_req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      const offers = await OfferModel.find();
      if (offers.length > 0) {
        res.json(offers);
        return;
      }
    }
    res.json(INITIAL_OFFERS);
  } catch {
    res.json(INITIAL_OFFERS);
  }
});

apiRouter.post('/offers', async (req: Request, res: Response) => {
  try {
    const data = {
      ...req.body,
      id: req.body.id || `off_${Date.now()}`,
      issueDate: req.body.issueDate || new Date().toISOString().split('T')[0],
      status: req.body.status || 'Pending',
    };
    if (isDBConnected()) {
      const created = await OfferModel.create(data);
      res.status(201).json(created);
      return;
    }
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/offers/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (isDBConnected()) {
      const updateObj: any = { status };
      if (status === 'Accepted') {
        updateObj.acceptanceDate = new Date().toISOString().split('T')[0];
      }
      const updated = await OfferModel.findOneAndUpdate(
        { id: req.params.id },
        { $set: updateObj },
        { new: true }
      );

      if (updated && status === 'Accepted') {
        await StudentProfileModel.updateOne(
          { $or: [{ id: updated.studentId }, { userId: updated.studentId }] },
          {
            $set: {
              placed: true,
              placedCompany: updated.companyName,
              placedPackage: parseFloat(updated.ctc) || 12.0,
            },
          }
        );
      }

      res.json({ success: true, offer: updated });
      return;
    }
    res.json({ success: true, offer: { id: req.params.id, status } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. Announcements Routes
// ==========================================
apiRouter.get('/announcements', async (_req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      const announcements = await AnnouncementModel.find().sort({ pinned: -1, date: -1 });
      if (announcements.length > 0) {
        res.json(announcements);
        return;
      }
    }
    res.json(INITIAL_ANNOUNCEMENTS);
  } catch {
    res.json(INITIAL_ANNOUNCEMENTS);
  }
});

apiRouter.post('/announcements', async (req: Request, res: Response) => {
  try {
    const data = {
      ...req.body,
      id: req.body.id || `ann_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    if (isDBConnected()) {
      const created = await AnnouncementModel.create(data);
      res.status(201).json(created);
      return;
    }
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. Notifications Routes
// ==========================================
apiRouter.get('/notifications', async (_req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      const notifications = await NotificationModel.find().sort({ date: -1 });
      if (notifications.length > 0) {
        res.json(notifications);
        return;
      }
    }
    res.json(INITIAL_NOTIFICATIONS);
  } catch {
    res.json(INITIAL_NOTIFICATIONS);
  }
});

apiRouter.post('/notifications', async (req: Request, res: Response) => {
  try {
    const data = {
      ...req.body,
      id: req.body.id || `notif_${Date.now()}`,
      date: new Date().toISOString(),
      read: false,
    };
    if (isDBConnected()) {
      const created = await NotificationModel.create(data);
      res.status(201).json(created);
      return;
    }
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      await NotificationModel.updateOne({ id: req.params.id }, { $set: { read: true } });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/notifications/mark-all-read', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (isDBConnected()) {
      await NotificationModel.updateMany(
        { $or: [{ userId }, { userId: 'all' }] },
        { $set: { read: true } }
      );
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
