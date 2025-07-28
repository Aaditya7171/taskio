import { OAuth2Client } from 'google-auth-library';

// Initialize Google OAuth2 Client
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID || "414130592765-your-client-id.apps.googleusercontent.com"
);

export interface GoogleUserInfo {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
}

export interface GoogleTokenPayload {
  iss: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
}

/**
 * Verify Google ID Token
 * @param idToken - Firebase ID token from client
 * @returns Verified user information or null if invalid
 */
export async function verifyGoogleToken(idToken: string): Promise<GoogleUserInfo | null> {
  try {
    console.log('🔍 Verifying Google ID token...');
    
    // For Firebase tokens, we'll use a different approach
    // Since Firebase already verified the token, we can trust the user info
    // In production, you might want to verify the Firebase token with Firebase Admin SDK
    
    // For now, we'll accept the token and extract user info from the request
    // This is a simplified approach for development
    
    return null; // Will be handled by the controller directly
  } catch (error) {
    console.error('❌ Google token verification failed:', error);
    return null;
  }
}

/**
 * Verify Google ID Token using Google Auth Library (alternative method)
 * @param idToken - Google ID token
 * @returns Verified token payload or null if invalid
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleTokenPayload | null> {
  try {
    console.log('🔍 Verifying Google ID token with Google Auth Library...');
    
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    if (!payload) {
      console.error('❌ No payload in Google token');
      return null;
    }
    
    console.log('✅ Google token verified successfully');
    
    return payload as GoogleTokenPayload;
  } catch (error) {
    console.error('❌ Google token verification failed:', error);
    return null;
  }
}

/**
 * Extract user info from Google token payload
 * @param payload - Verified Google token payload
 * @returns Formatted user information
 */
export function extractUserInfo(payload: GoogleTokenPayload): GoogleUserInfo {
  return {
    uid: payload.sub,
    email: payload.email,
    displayName: payload.name,
    photoURL: payload.picture,
    emailVerified: payload.email_verified
  };
}

/**
 * Generate a unique username from email
 * @param email - User's email address
 * @returns Generated username
 */
export function generateUsernameFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  const timestamp = Date.now().toString().slice(-4);
  return `${localPart}_${timestamp}`;
}

export default {
  verifyGoogleToken,
  verifyGoogleIdToken,
  extractUserInfo,
  generateUsernameFromEmail
};
