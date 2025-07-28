import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  signOut,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider } from '@/config/firebase';
import { authCookies } from '@/utils/cookies';
import { api } from '@/utils/api';

export interface GoogleAuthResult {
  success: boolean;
  user?: any;
  token?: string;
  error?: string;
  requiresVerification?: boolean;
}

export interface GoogleUserInfo {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
}

class GoogleAuthService {
  // Sign in with Google using popup
  async signInWithPopup(): Promise<GoogleAuthResult> {
    try {
      console.log('🔐 Starting Google Sign-In with popup...');

      // Try popup with error handling for COOP issues
      let result: UserCredential;
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupError: any) {
        console.warn('Popup failed, trying redirect:', popupError);
        // If popup fails due to COOP, fallback to redirect
        if (popupError.code === 'auth/popup-blocked' ||
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.message?.includes('Cross-Origin-Opener-Policy') ||
            popupError.message?.includes('window.closed')) {
          console.log('🔄 Falling back to redirect method...');
          await this.signInWithRedirect();
          return { success: true }; // Redirect will handle the rest
        }
        throw popupError;
      }

      const user = result.user;
      
      if (!user) {
        return {
          success: false,
          error: 'No user data received from Google'
        };
      }

      console.log('✅ Google Sign-In successful:', user.email);
      
      // Get Firebase ID token
      const idToken = await user.getIdToken();
      
      // Extract user info
      const googleUserInfo: GoogleUserInfo = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified
      };

      // Send to backend for verification and user creation/login
      const backendResult = await this.authenticateWithBackend(googleUserInfo, idToken);
      
      return backendResult;
    } catch (error: any) {
      console.error('❌ Google Sign-In error:', error);
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        return {
          success: false,
          error: 'Sign-in was cancelled'
        };
      } else if (error.code === 'auth/popup-blocked') {
        return {
          success: false,
          error: 'Popup was blocked by browser. Please allow popups and try again.'
        };
      } else if (error.code === 'auth/cancelled-popup-request') {
        return {
          success: false,
          error: 'Another sign-in popup is already open'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Failed to sign in with Google'
      };
    }
  }

  // Sign in with Google using redirect (fallback for mobile)
  async signInWithRedirect(): Promise<void> {
    try {
      console.log('🔐 Starting Google Sign-In with redirect...');
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      console.error('❌ Google Sign-In redirect error:', error);
      throw error;
    }
  }

  // Handle redirect result (call this on app initialization)
  async handleRedirectResult(): Promise<GoogleAuthResult | null> {
    try {
      const result = await getRedirectResult(auth);
      
      if (!result) {
        return null; // No redirect result
      }

      const user = result.user;
      console.log('✅ Google Sign-In redirect successful:', user.email);
      
      // Get Firebase ID token
      const idToken = await user.getIdToken();
      
      // Extract user info
      const googleUserInfo: GoogleUserInfo = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified
      };

      // Send to backend for verification and user creation/login
      const backendResult = await this.authenticateWithBackend(googleUserInfo, idToken);
      
      return backendResult;
    } catch (error: any) {
      console.error('❌ Google Sign-In redirect result error:', error);
      return {
        success: false,
        error: error.message || 'Failed to handle Google sign-in redirect'
      };
    }
  }

  // Authenticate with backend
  private async authenticateWithBackend(googleUser: GoogleUserInfo, idToken: string): Promise<GoogleAuthResult> {
    try {
      console.log('🔄 Authenticating with backend...');
      
      const response = await api.post('/auth/google', {
        googleUser,
        idToken
      });

      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        
        // Store auth token in cookies
        authCookies.setAuthToken(token);
        authCookies.setUserData(user);
        
        console.log('✅ Backend authentication successful');
        
        return {
          success: true,
          user,
          token
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Backend authentication failed'
        };
      }
    } catch (error: any) {
      console.error('❌ Backend authentication error:', error);
      
      if (error.response?.data?.error) {
        return {
          success: false,
          error: error.response.data.error
        };
      }
      
      return {
        success: false,
        error: 'Failed to authenticate with server'
      };
    }
  }

  // Sign out from Google
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      
      // Clear auth cookies
      authCookies.clearAuthCookies();
      
      console.log('✅ Google Sign-Out successful');
    } catch (error: any) {
      console.error('❌ Google Sign-Out error:', error);
      throw error;
    }
  }

  // Get current Firebase user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Check if user is signed in with Google
  isSignedIn(): boolean {
    return auth.currentUser !== null;
  }

  // Get user's Google profile info
  async getUserProfile(): Promise<GoogleUserInfo | null> {
    const user = auth.currentUser;
    if (!user) return null;

    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      emailVerified: user.emailVerified
    };
  }
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService();
export default googleAuthService;
