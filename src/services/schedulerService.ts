import cron from 'node-cron';
import { query } from '../config/database';
import { sendTaskReminderEmail } from './reminderService';

// Interface for overdue task data
interface OverdueTask {
  id: string;
  title: string;
  due_date: string;
  user_email: string;
  user_name: string;
  reminder_count: number;
  last_reminder_sent: string | null;
}

// Calculate days overdue
const getDaysOverdue = (dueDate: string): number => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = now.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// Check if we should send a reminder (not sent in last 24 hours)
const shouldSendReminder = (lastReminderSent: string | null): boolean => {
  if (!lastReminderSent) return true;
  
  const lastSent = new Date(lastReminderSent);
  const now = new Date();
  const hoursSinceLastReminder = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceLastReminder >= 24;
};

// Process overdue tasks and send reminders
export const processOverdueTaskReminders = async (): Promise<void> => {
  try {
    console.log('🔍 Checking for overdue tasks requiring reminders...');

    // Query for overdue tasks that need reminders
    const overdueTasksResult = await query(`
      SELECT 
        t.id,
        t.title,
        t.due_date,
        u.email as user_email,
        u.name as user_name,
        COALESCE(t.reminder_count, 0) as reminder_count,
        t.last_reminder_sent
      FROM tasks t
      JOIN users u ON t.user_id = u.id
      WHERE 
        t.status != 'done'
        AND t.due_date < NOW()
        AND u.alerts_enabled = true
        AND COALESCE(t.reminder_count, 0) < 3
        AND (
          t.last_reminder_sent IS NULL 
          OR t.last_reminder_sent < NOW() - INTERVAL '24 hours'
        )
      ORDER BY t.due_date ASC
    `);

    const overdueTasks: OverdueTask[] = overdueTasksResult.rows;

    if (overdueTasks.length === 0) {
      console.log('✅ No overdue tasks requiring reminders found');
      return;
    }

    console.log(`📧 Found ${overdueTasks.length} overdue tasks requiring reminders`);

    let remindersSent = 0;
    let remindersSkipped = 0;

    for (const task of overdueTasks) {
      try {
        const daysOverdue = getDaysOverdue(task.due_date);
        
        // Only send reminders for tasks overdue by 1-3 days
        if (daysOverdue < 1 || daysOverdue > 3) {
          remindersSkipped++;
          continue;
        }

        // Double-check if we should send reminder
        if (!shouldSendReminder(task.last_reminder_sent)) {
          remindersSkipped++;
          continue;
        }

        // Send reminder email
        await sendTaskReminderEmail(
          task.user_email,
          task.user_name,
          task.title,
          daysOverdue
        );

        // Update task reminder tracking
        await query(
          `UPDATE tasks 
           SET 
             reminder_count = COALESCE(reminder_count, 0) + 1,
             last_reminder_sent = NOW()
           WHERE id = $1`,
          [task.id]
        );

        remindersSent++;
        console.log(`✅ Reminder sent for task "${task.title}" to ${task.user_email} (${daysOverdue} days overdue)`);

        // Add small delay between emails to avoid overwhelming the email service
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Failed to send reminder for task "${task.title}":`, error);
        // Continue with other tasks even if one fails
      }
    }

    console.log(`📊 Reminder processing complete: ${remindersSent} sent, ${remindersSkipped} skipped`);

  } catch (error) {
    console.error('❌ Error processing overdue task reminders:', error);
  }
};

// Initialize the scheduler
export const initializeTaskReminderScheduler = (): void => {
  console.log('🚀 Initializing task reminder scheduler...');

  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log(`⏰ Task reminder scheduler triggered at ${new Date().toISOString()}`);
    await processOverdueTaskReminders();
  }, {
    timezone: "UTC"
  });

  // Also run once on startup (after 30 seconds to allow server to fully initialize)
  setTimeout(async () => {
    console.log('🔄 Running initial task reminder check...');
    await processOverdueTaskReminders();
  }, 30000);

  console.log('✅ Task reminder scheduler initialized successfully');
  console.log('📅 Reminders will be checked every hour at minute 0');
};

// Manual trigger for testing (can be called via API endpoint)
export const triggerManualReminderCheck = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    console.log('🔧 Manual reminder check triggered');
    await processOverdueTaskReminders();
    return {
      success: true,
      message: 'Manual reminder check completed successfully'
    };
  } catch (error) {
    console.error('❌ Manual reminder check failed:', error);
    return {
      success: false,
      message: 'Manual reminder check failed'
    };
  }
};
