import { query } from '../config/database';

const runMigration = async () => {
  try {
    console.log('🚀 Running rating system migration...');

    // Create user_ratings table
    await query(`
      CREATE TABLE IF NOT EXISTS user_ratings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `);
    console.log('✅ Created user_ratings table');

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_ratings_rating ON user_ratings(rating)`);
    console.log('✅ Created indexes for user_ratings');

    // Add columns to tasks table for reminder system
    await query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_reminder_sent TIMESTAMP WITH TIME ZONE`);
    await query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0`);
    console.log('✅ Added reminder columns to tasks table');

    // Add columns to users table for alert preferences
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS alerts_enabled BOOLEAN DEFAULT false`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS alerts_activated_at TIMESTAMP WITH TIME ZONE`);
    console.log('✅ Added alert preference columns to users table');

    console.log('🎉 Rating system migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
