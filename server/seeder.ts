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
} from './models';
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
} from '../src/data/mockData';
import bcrypt from 'bcryptjs';

export async function seedDatabase(force: boolean = false): Promise<{ seeded: boolean; message: string }> {
  try {
    const userCount = await UserModel.countDocuments();

    if (userCount > 0 && !force) {
      return { seeded: false, message: 'Database already contains data; skipping initial seed.' };
    }

    if (force) {
      console.log('[Seeder] Force cleaning existing collections...');
      await Promise.all([
        UserModel.deleteMany({}),
        StudentProfileModel.deleteMany({}),
        CompanyModel.deleteMany({}),
        PlacementDriveModel.deleteMany({}),
        ApplicationModel.deleteMany({}),
        InterviewModel.deleteMany({}),
        OfferModel.deleteMany({}),
        AnnouncementModel.deleteMany({}),
        NotificationModel.deleteMany({}),
      ]);
    }

    console.log('[Seeder] Seeding initial campus placement data into MongoDB...');

    // Hash default password for demo accounts
    const hashedPassword = await bcrypt.hash('password123', 10);

    const usersWithPassword = INITIAL_USERS.map((u) => ({
      ...u,
      password: hashedPassword,
    }));

    await UserModel.insertMany(usersWithPassword);
    await StudentProfileModel.insertMany(INITIAL_STUDENTS);
    await CompanyModel.insertMany(INITIAL_COMPANIES);
    await PlacementDriveModel.insertMany(INITIAL_DRIVES);
    await ApplicationModel.insertMany(INITIAL_APPLICATIONS);
    await InterviewModel.insertMany(INITIAL_INTERVIEWS);
    await OfferModel.insertMany(INITIAL_OFFERS);
    await NotificationModel.insertMany(INITIAL_NOTIFICATIONS);
    await AnnouncementModel.insertMany(INITIAL_ANNOUNCEMENTS);

    console.log('[Seeder] Database seeding completed successfully.');
    return { seeded: true, message: 'MongoDB Atlas seeded with campus placement records.' };
  } catch (err: any) {
    console.error('[Seeder] Error seeding database:', err.message);
    return { seeded: false, message: err.message };
  }
}
