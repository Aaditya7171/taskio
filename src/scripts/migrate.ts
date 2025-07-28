import { query } from '../config/database';

const createTables = async () => {
  try {
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stack_user_id VARCHAR(255) UNIQUE,
        google_id VARCHAR(255) UNIQUE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        age INTEGER,
        profile_picture_url TEXT,
        email_verified BOOLEAN DEFAULT FALSE,
        email_verification_token VARCHAR(255),
        email_verification_expires TIMESTAMP,
        task_reminders_enabled BOOLEAN DEFAULT FALSE,
        otp_token VARCHAR(255),
        otp_expires TIMESTAMP,
        otp_purpose VARCHAR(50) CHECK (otp_purpose IN ('verify_email', 'forgot_password', '2fa_login')),
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create tasks table
    await query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date TIMESTAMP,
        priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
        status VARCHAR(20) CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create attachments table
    await query(`
      CREATE TABLE IF NOT EXISTS attachments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        file_url TEXT NOT NULL,
        file_type VARCHAR(20) CHECK (file_type IN ('image', 'audio', 'document')) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create journals table
    await query(`
      CREATE TABLE IF NOT EXISTS journals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        entry TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create habits table
    await query(`
      CREATE TABLE IF NOT EXISTS habits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        streak_count INTEGER DEFAULT 0,
        last_completed TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create habit_completions table for tracking daily completions
    await query(`
      CREATE TABLE IF NOT EXISTS habit_completions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        completed_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(habit_id, completed_date)
      );
    `);

    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
      CREATE INDEX IF NOT EXISTS idx_attachments_task_id ON attachments(task_id);
      CREATE INDEX IF NOT EXISTS idx_journals_task_id ON journals(task_id);
      CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
      CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
    `);

    // Add google_id column if it doesn't exist (for existing databases)
    await query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
    `);

    console.log('Database tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { createTables };
