import { Request, Response } from 'express';
import { sendWelcomeAlertsEmail } from '../services/reminderService';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse } from '../types';

// Test welcome email sending
export const testWelcomeEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    
    console.log(`🧪 Testing welcome email for user: ${user.email}`);
    
    await sendWelcomeAlertsEmail(user.email, user.name);
    
    res.json({
      success: true,
      message: `Welcome email sent to ${user.email}`
    } as ApiResponse);
  } catch (error) {
    console.error('❌ Test welcome email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test welcome email'
    } as ApiResponse);
  }
};
