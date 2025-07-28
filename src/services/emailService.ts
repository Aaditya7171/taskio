// SendGrid configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

// Working email service with proper SendGrid implementation
const sendEmailViaSendGrid = async (to: string, subject: string, htmlContent: string, textContent: string) => {
  try {
    const emailData = {
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject
        }
      ],
      from: { email: 'verifytaskio@gmail.com', name: 'Taskio - Email Verification' },
      reply_to: { email: 'verifytaskio@gmail.com', name: 'Taskio Support' },
      content: [
        {
          type: 'text/plain',
          value: textContent
        },
        {
          type: 'text/html',
          value: htmlContent
        }
      ],
      // Anti-spam headers
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'Taskio Email Service',
        'List-Unsubscribe': '<mailto:verifytaskio@gmail.com?subject=unsubscribe>',
      },
      // Categories for tracking
      categories: ['email-verification', 'transactional'],
      // Custom args for tracking
      custom_args: {
        'email_type': 'verification',
        'app': 'taskio'
      }
    };

    console.log('📤 Sending email via SendGrid API...');

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const responseText = await response.text();

    console.log(`📬 SendGrid Response Status: ${response.status}`);
    console.log(`📬 SendGrid Response Headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error(`❌ SendGrid API Error: ${response.status} ${response.statusText}`);
      console.error(`❌ Response Body: ${responseText}`);
      throw new Error(`SendGrid API error: ${response.status} ${response.statusText} - ${responseText}`);
    }

    console.log('✅ Email sent successfully via SendGrid');
    return { statusCode: response.status };
  } catch (error) {
    console.error('SendGrid email sending failed:', error);
    throw error;
  }
};

console.log('✅ SendGrid email service initialized for real email sending');

const FROM_EMAIL = 'verifytaskio@gmail.com';

export const sendVerificationEmail = async (email: string, otp: string, name: string): Promise<void> => {
  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: '[Taskio] Email Verification Required - Action Needed',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Taskio Email Verification</title>
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
          .container {
            background: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 20px;
          }
          .company-info {
            text-align: center;
            margin-bottom: 20px;
            color: #64748b;
            font-size: 14px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #7c3aed;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #6b7280;
            font-size: 16px;
          }
          .otp-container {
            background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: white;
            letter-spacing: 8px;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          .otp-label {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            margin-top: 10px;
          }
          .instructions {
            background: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .instructions h3 {
            margin: 0 0 10px 0;
            color: #374151;
            font-size: 16px;
          }
          .instructions p {
            margin: 5px 0;
            color: #6b7280;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #9ca3af;
            font-size: 14px;
          }
          .warning {
            background: #fef3cd;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="company-info">
            <strong>Taskio Task Management Platform</strong><br>
            Automated Email Verification System<br>
            <small>This is a transactional email sent to verify your account</small>
          </div>

          <div class="header">
            <div class="logo">📋 Taskio</div>
            <h1 class="title">Email Verification Required</h1>
            <p class="subtitle">Hello ${name}, please verify your email address to activate your account</p>
          </div>

          <div style="margin: 20px 0; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #7c3aed;">
            <h3 style="margin: 0 0 10px 0; color: #1e293b;">Account Verification</h3>
            <p style="margin: 0; color: #475569;">You recently created a Taskio account. To complete your registration and access all features, please verify your email address.</p>
          </div>

          <div class="otp-container">
            <div class="otp-code">${otp}</div>
            <div class="otp-label">Your 6-digit verification code</div>
          </div>

          <div class="instructions">
            <h3 style="color: #1e293b; margin-bottom: 15px;">Verification Steps:</h3>
            <ol style="padding-left: 20px; color: #475569;">
              <li style="margin-bottom: 8px;">Copy the 6-digit verification code above</li>
              <li style="margin-bottom: 8px;">Return to the Taskio application</li>
              <li style="margin-bottom: 8px;">Paste the code in the email verification field</li>
              <li style="margin-bottom: 8px;">Click "Verify Email" to complete the process</li>
            </ol>
          </div>

          <div class="warning">
            <strong>🔒 Security Information:</strong> This verification code expires in 10 minutes for your security. If you did not create a Taskio account, please disregard this email.
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <h4 style="color: #1e293b; margin-bottom: 10px;">Need Help?</h4>
            <p style="color: #475569; margin-bottom: 15px;">If you're having trouble with verification, please contact our support team.</p>
          </div>

          <div class="footer">
            <p><strong>Taskio Task Management Platform</strong></p>
            <p>This email was automatically generated by our secure verification system.</p>
            <p style="font-size: 12px; color: #64748b;">© 2024 Taskio. All rights reserved.</p>
            <p style="font-size: 12px; color: #64748b;">
              You received this email because you created an account on Taskio.<br>
              If you did not create an account, please ignore this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
TASKIO TASK MANAGEMENT PLATFORM
Email Verification Required

Hello ${name},

Thank you for creating a Taskio account. To complete your registration and activate your account, please verify your email address.

VERIFICATION CODE: ${otp}

VERIFICATION STEPS:
1. Copy the 6-digit verification code above
2. Return to the Taskio application
3. Paste the code in the email verification field
4. Click "Verify Email" to complete the process

SECURITY INFORMATION:
- This verification code expires in 10 minutes for your security
- If you did not create a Taskio account, please disregard this email
- This is an automated message from our secure verification system

NEED HELP?
If you're having trouble with verification, please contact our support team at verifytaskio@gmail.com

---
Taskio Task Management Platform
© 2024 Taskio. All rights reserved.

This email was automatically generated by our secure verification system.
You received this email because you created an account on Taskio.
    `
  };

  try {
    console.log(`📧 Attempting to send verification email to: ${email}`);
    console.log(`📧 Subject: ${msg.subject}`);
    console.log(`📧 OTP: ${otp}`);

    await sendEmailViaSendGrid(msg.to, msg.subject, msg.html, msg.text);
    console.log(`✅ Verification email successfully sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendPasswordResetEmail = async (email: string, otp: string, name: string): Promise<void> => {
  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Reset Your Password - Taskio',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #7c3aed;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 10px 0;
          }
          .subtitle {
            color: #6b7280;
            font-size: 16px;
            margin: 0;
          }
          .otp-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: white;
            letter-spacing: 8px;
            margin-bottom: 10px;
            font-family: 'Courier New', monospace;
          }
          .otp-label {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .instructions {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .instructions h3 {
            margin: 0 0 15px 0;
            color: #374151;
            font-size: 16px;
          }
          .instructions p {
            margin: 5px 0;
            color: #6b7280;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #9ca3af;
            font-size: 14px;
          }
          .warning {
            background: #fef3cd;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔐 Taskio</div>
            <h1 class="title">Reset Your Password</h1>
            <p class="subtitle">Hi ${name}, use this code to reset your password</p>
          </div>

          <div class="otp-container">
            <div class="otp-code">${otp}</div>
            <div class="otp-label">Your password reset code</div>
          </div>

          <div class="instructions">
            <h3>How to reset your password:</h3>
            <p>1. Copy the 6-digit code above</p>
            <p>2. Return to Taskio and paste it in the verification field</p>
            <p>3. Enter your new password and confirm it</p>
            <p>4. Click "Reset Password" to complete the process</p>
          </div>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong> This code expires in 10 minutes. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
          </div>

          <div class="footer">
            <p>This email was sent by Taskio</p>
            <p>If you have any questions, please contact our support team</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${name},

      Your Taskio password reset code is: ${otp}

      Please enter this code in the password reset field to reset your password.
      This code expires in 10 minutes.

      If you didn't request this password reset, please ignore this email.

      Best regards,
      The Taskio Team
    `
  };

  try {
    await sendEmailViaSendGrid(msg.to, msg.subject, msg.html, msg.text);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

export const send2FAEmail = async (email: string, otp: string, name: string): Promise<void> => {
  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Two-Factor Authentication Code - Taskio',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Two-Factor Authentication</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #7c3aed;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 10px 0;
          }
          .subtitle {
            color: #6b7280;
            font-size: 16px;
            margin: 0;
          }
          .otp-container {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: white;
            letter-spacing: 8px;
            margin-bottom: 10px;
            font-family: 'Courier New', monospace;
          }
          .otp-label {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .instructions {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .instructions h3 {
            margin: 0 0 15px 0;
            color: #374151;
            font-size: 16px;
          }
          .instructions p {
            margin: 5px 0;
            color: #6b7280;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #9ca3af;
            font-size: 14px;
          }
          .warning {
            background: #fef3cd;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🛡️ Taskio</div>
            <h1 class="title">Two-Factor Authentication</h1>
            <p class="subtitle">Hi ${name}, complete your secure login</p>
          </div>

          <div class="otp-container">
            <div class="otp-code">${otp}</div>
            <div class="otp-label">Your 2FA verification code</div>
          </div>

          <div class="instructions">
            <h3>Complete your login:</h3>
            <p>1. Copy the 6-digit code above</p>
            <p>2. Return to Taskio and paste it in the 2FA verification field</p>
            <p>3. Click "Verify" to complete your secure login</p>
          </div>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong> This code expires in 10 minutes. If you didn't attempt to log in, please secure your account immediately.
          </div>

          <div class="footer">
            <p>This email was sent by Taskio</p>
            <p>If you have any questions, please contact our support team</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${name},

      Your Taskio two-factor authentication code is: ${otp}

      Please enter this code to complete your secure login.
      This code expires in 10 minutes.

      If you didn't attempt to log in, please secure your account immediately.

      Best regards,
      The Taskio Team
    `
  };

  try {
    await sendEmailViaSendGrid(msg.to, msg.subject, msg.html, msg.text);
    console.log(`2FA email sent to ${email}`);
  } catch (error) {
    console.error('Error sending 2FA email:', error);
    throw new Error('Failed to send 2FA email');
  }
};

export const sendTaskReminderEmail = async (email: string, tasks: any[], name: string): Promise<void> => {
  const taskList = tasks.map(task => `• ${task.title} ${task.due_date ? `(Due: ${new Date(task.due_date).toLocaleDateString()})` : ''}`).join('\n');

  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Task Reminders - Taskio',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Reminders</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #7c3aed;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .task-list {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .task-item {
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
            color: #374151;
          }
          .task-item:last-child {
            border-bottom: none;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #9ca3af;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📋 Taskio</div>
            <h1 class="title">Task Reminders</h1>
            <p>Hi ${name}, here are your pending tasks:</p>
          </div>

          <div class="task-list">
            ${tasks.map(task => `
              <div class="task-item">
                <strong>${task.title}</strong>
                ${task.due_date ? `<br><small>Due: ${new Date(task.due_date).toLocaleDateString()}</small>` : ''}
                ${task.description ? `<br><span style="color: #6b7280;">${task.description}</span>` : ''}
              </div>
            `).join('')}
          </div>

          <div class="footer">
            <p>Stay productive with Taskio!</p>
            <p>You can disable these reminders in your profile settings</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${name},

      Here are your pending tasks:

      ${taskList}

      Stay productive!

      The Taskio Team
    `
  };

  try {
    await sendEmailViaSendGrid(msg.to, msg.subject, msg.html, msg.text);
    console.log(`Task reminder email sent to ${email}`);
  } catch (error) {
    console.error('Error sending task reminder email:', error);
    throw new Error('Failed to send task reminder email');
  }
};
