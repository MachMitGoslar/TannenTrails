import { Injectable, inject } from '@angular/core';
import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signInWithPopup,
  OAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface AuthError {
  code: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);

  private userSubject = new BehaviorSubject<User | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public user$ = this.userSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor() {
    console.log('AuthService initialized', this.auth);
    // Listen for authentication state changes
    onAuthStateChanged(this.auth, user => {
      console.log('Auth state changed:', user?.providerData || 'No user');
      this.userSubject.next(user);
    });
  }

  /**
   * Get the current user
   */
  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  get isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  /**
   * Get current user profile information
   */
  get userProfile(): UserProfile | null {
    const user = this.currentUser;
    if (!user) return null;

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
  }

  /**
   * Register a new user with email and password
   */
  async register(email: string, password: string, displayName?: string): Promise<User> {
    try {
      this.loadingSubject.next(true);

      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Update display name if provided
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      console.log('User registered successfully:', user.email);
      return user;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<User> {
    try {
      this.loadingSubject.next(true);

      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      console.log('User signed in successfully:', user.email);
      return user;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw this.handleAuthError(error);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async loginWithOICD() {
    try {
      let provider = new OAuthProvider('oidc.goslar_id');
      provider.setCustomParameters({
        // 'response_mode': 'query',
        pkce: 'true',
        // 'post_logout_redirect_uri': '/'
      });
      provider.addScope('offline_access email profile openid');
      signInWithPopup(this.auth, provider)
        .then(result => {
          // This gives you a Nextcloud Access Token. You can use it to access the Nextcloud API.
          const credential = OAuthProvider.credentialFromResult(result);
          const token = credential?.accessToken;

          console.log('OICD2 login successful, token:', token);
          console.log('User info:', result);

          fetch('https://preview.backend.goslar-id.ceconsoft.de/connect/userinfo', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then(response => response.json())
            .then(data => {
              console.log('User info from OICD provider:', data);
            })
            .catch(error => {
              console.error('Error fetching user info from OICD provider:', error);
            });

          // The signed-in user info.
          const user = result.user;
        })
        .catch(error => {
          console.error('OICD2 login error:', error);
        });
    } catch (error: any) {
      console.error('OICD login error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      console.log('User signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      this.loadingSubject.next(true);

      await sendPasswordResetEmail(this.auth, email);
      console.log('Password reset email sent to:', email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw this.handleAuthError(error);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: { displayName?: string; photoURL?: string }): Promise<void> {
    try {
      const user = this.currentUser;
      if (!user) {
        throw new Error('No user signed in');
      }

      await updateProfile(user, updates);
      console.log('User profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Handle Firebase auth errors and provide user-friendly messages
   */
  private handleAuthError(error: any): AuthError {
    let message = 'An unknown error occurred';

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email address is already registered. Please sign in instead.';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak. Please choose a stronger password.';
        break;
      case 'auth/invalid-email':
        message = 'Please enter a valid email address.';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password. Please try again.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your internet connection.';
        break;
      case 'auth/invalid-credential':
        message = 'Invalid email or password. Please check your credentials.';
        break;
      default:
        message = error.message || 'Authentication failed. Please try again.';
    }

    return {
      code: error.code || 'unknown-error',
      message,
    };
  }
}
