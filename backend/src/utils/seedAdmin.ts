import User from '../models/User';
import logger from './logger';

/**
 * Seeds the admin user in MongoDB on server startup.
 * Uses credentials from environment variables.
 * Only creates the admin if one doesn't already exist.
 */
export const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      logger.info('No ADMIN_EMAIL set in .env — skipping admin seed.');
      return;
    }

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      // Ensure the role is always 'admin'
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        logger.info(`Upgraded existing user ${adminEmail} to admin role.`);
      } else {
        logger.info(`Admin user already exists`);
      }
    } else {
      await User.create({
        name: 'Venorum Admin',
        email: adminEmail,
        firebaseUid: `admin-${Date.now()}`,
        role: 'admin',
      });
      logger.info(`Admin user seeded successfully: ${adminEmail}`);
    }
  } catch (error: any) {
    logger.error(`Admin seed error: ${error.message}`);
  }
};
