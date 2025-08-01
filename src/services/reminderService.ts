import { query } from '../config/database';
import { sendEmail } from './emailService';

// Send welcome email when user enables alerts
export const sendWelcomeAlertsEmail = async (email: string, name: string): Promise<void> => {
  const subject = 'Task Reminders Activated - Welcome to Taskio Alerts';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Taskio Reminders</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
        .feature { margin: 15px 0; padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #667eea; }
        .unsubscribe { color: #64748b; text-decoration: none; }
        .unsubscribe:hover { color: #475569; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Task Reminders Activated!</h1>
          <p>Your productivity assistant is now active</p>
        </div>
        
        <div class="content">
          <h2>Hi ${name}! 👋</h2>
          
          <p>Thank you for enabling task reminders! You've just activated one of Taskio's most powerful productivity features.</p>
          
          <div class="feature">
            <h3>📅 How Reminders Work</h3>
            <p>We'll send you gentle reminders for overdue tasks:</p>
            <ul>
              <li><strong>Day 1:</strong> First reminder when a task becomes overdue</li>
              <li><strong>Day 2:</strong> Second reminder if still incomplete</li>
              <li><strong>Day 3:</strong> Final reminder to help you stay on track</li>
            </ul>
          </div>
          
          <div class="feature">
            <h3>⚡ Smart & Non-Intrusive</h3>
            <p>Our reminders are designed to help, not overwhelm:</p>
            <ul>
              <li>Maximum 3 reminders per task</li>
              <li>Only sent once per day</li>
              <li>Personalized with your task details</li>
              <li>Easy to manage or disable anytime</li>
            </ul>
          </div>
          
          <p>Ready to boost your productivity? Your reminders are now active!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/tasks" class="button">View My Tasks</a>
          </div>
          
          <p><small>You can manage your reminder preferences anytime in your <a href="${process.env.FRONTEND_URL}/profile">profile settings</a>.</small></p>
        </div>
        
        <div class="footer">
          <p>This email was sent because you enabled task reminders in your Taskio account.</p>
          <p>© 2025 Taskio. Built with ❤️ for productivity.</p>
          <p>Contact: <a href="mailto:verifytaskio@gmail.com">verifytaskio@gmail.com</a></p>
          <p><a href="${process.env.FRONTEND_URL}/profile" class="unsubscribe">Manage email preferences</a> | <a href="${process.env.FRONTEND_URL}/profile" class="unsubscribe">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Welcome to Taskio Reminders!
    
    Hi ${name}!
    
    Thank you for enabling task reminders! You've just activated one of Taskio's most powerful productivity features.
    
    How Reminders Work:
    - Day 1: First reminder when a task becomes overdue
    - Day 2: Second reminder if still incomplete  
    - Day 3: Final reminder to help you stay on track
    
    Smart & Non-Intrusive:
    - Maximum 3 reminders per task
    - Only sent once per day
    - Personalized with your task details
    - Easy to manage or disable anytime
    
    Ready to boost your productivity? Your reminders are now active!
    
    View your tasks: ${process.env.FRONTEND_URL}/tasks
    Manage settings: ${process.env.FRONTEND_URL}/profile
    
    Contact: verifytaskio@gmail.com
    © 2025 Taskio. Built with ❤️ for productivity.
  `;

  try {
    await sendEmail(email, subject, htmlContent, textContent);
    console.log(`✅ Welcome alerts email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending welcome alerts email:', error);
    throw new Error('Failed to send welcome alerts email');
  }
};

// Send task reminder email
export const sendTaskReminderEmail = async (
  email: string, 
  name: string, 
  taskTitle: string, 
  daysOverdue: number
): Promise<void> => {
  const subject = `Reminder: "${taskTitle}" is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`;
  
  const reminderMessages = {
    1: "Don't worry, we all miss deadlines sometimes! Here's a gentle reminder to help you get back on track.",
    2: "Your task is still waiting for you. A little progress today can make a big difference!",
    3: "This is your final reminder for this task. You've got this - let's finish strong!"
  };

  const encouragements = {
    1: "🌟 You're doing great! Just need to tackle this one task.",
    2: "💪 Keep going! Every completed task is a step forward.",
    3: "🎯 Final push! Complete this task and feel the satisfaction."
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Task Reminder - ${taskTitle}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
        .task-card { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .overdue-badge { background: #dc2626; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Task Reminder</h1>
          <p>${encouragements[daysOverdue as keyof typeof encouragements]}</p>
        </div>
        
        <div class="content">
          <h2>Hi ${name}! 👋</h2>
          
          <p>${reminderMessages[daysOverdue as keyof typeof reminderMessages]}</p>
          
          <div class="task-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h3 style="margin: 0; color: #92400e;">📋 ${taskTitle}</h3>
              <span class="overdue-badge">${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue</span>
            </div>
            <p style="margin: 0; color: #92400e;">This task is waiting for your attention!</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/tasks" class="button">Complete Task Now</a>
          </div>
          
          <p><small>This is reminder ${daysOverdue} of 3. You can disable reminders anytime in your <a href="${process.env.FRONTEND_URL}/profile">profile settings</a>.</small></p>
        </div>
        
        <div class="footer">
          <p>This reminder was sent because you have task alerts enabled.</p>
          <p>© 2025 Taskio. Built with ❤️ for productivity.</p>
          <p><a href="${process.env.FRONTEND_URL}/profile">Manage Preferences</a> | <a href="mailto:verifytaskio@gmail.com">Contact Support</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Task Reminder - ${taskTitle}
    
    Hi ${name}!
    
    ${reminderMessages[daysOverdue as keyof typeof reminderMessages]}
    
    Task: ${taskTitle}
    Status: ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue
    
    Complete your task: ${process.env.FRONTEND_URL}/tasks
    
    This is reminder ${daysOverdue} of 3. You can disable reminders anytime in your profile settings.
    
    Manage preferences: ${process.env.FRONTEND_URL}/profile
    Contact: verifytaskio@gmail.com
    © 2025 Taskio. Built with ❤️ for productivity.
  `;

  try {
    await sendEmail(email, subject, htmlContent, textContent);
    console.log(`✅ Task reminder email sent to ${email} for task: ${taskTitle}`);
  } catch (error) {
    console.error('❌ Error sending task reminder email:', error);
    throw new Error('Failed to send task reminder email');
  }
};
