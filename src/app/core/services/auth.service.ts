import { Injectable, inject } from '@angular/core';
import {
  Auth,
  User,
  OAuthProvider,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  /** Provider used to sign in (e.g. 'password', 'oidc.goslar_id') */
  providerId: string | null;
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

  /**
   * OIDC access token from the Goslar-ID provider, stored after a successful
   * OIDC login. Consumers (e.g. a future external API service) can read this
   * token directly. Cleared on sign-out.
   */
  private oidcAccessTokenSubject = new BehaviorSubject<string | null>(null);

  public user$ = this.userSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  /** Emits the raw Goslar-ID OIDC access token whenever it changes. */
  public oidcAccessToken$ = this.oidcAccessTokenSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, user => {
      this.userSubject.next(user);
      // Clear the OIDC token whenever the session ends
      if (!user) {
        this.oidcAccessTokenSubject.next(null);
      }
    });
  }

  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  get userProfile(): UserProfile | null {
    const user = this.currentUser;
    if (!user) return null;

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      providerId: user.providerData[0]?.providerId ?? null,
    };
  }

  /**
   * Returns a short-lived Firebase ID token (JWT) for the current user.
   * This token can be sent as a Bearer token to any custom backend that
   * validates it against the Firebase project. Refreshed automatically.
   * Returns null when no user is signed in.
   */
  async getFirebaseIdToken(): Promise<string | null> {
    const user = this.currentUser;
    if (!user) return null;
    return user.getIdToken();
  }

  /**
   * Returns the current Goslar-ID OIDC access token synchronously.
   * Only populated after a successful `loginWithOIDC()` call.
   * Use `oidcAccessToken$` to react to changes over time.
   */
  get oidcAccessToken(): string | null {
    return this.oidcAccessTokenSubject.value;
  }

  async register(email: string, password: string, displayName?: string): Promise<User> {
    try {
      this.loadingSubject.next(true);
      const { user } = await createUserWithEmailAndPassword(this.auth, email, password);
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      return user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async signIn(email: string, password: string): Promise<User> {
    try {
      this.loadingSubject.next(true);
      const { user } = await signInWithEmailAndPassword(this.auth, email, password);
      return user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Sign in via the Goslar-ID OIDC provider. On success the Goslar-ID access
   * token is stored in `oidcAccessToken$` for use by other services that need
   * to call the Goslar-ID API directly.
   */
  async loginWithOIDC(): Promise<UserCredential> {
    try {
      this.loadingSubject.next(true);

      const provider = new OAuthProvider('oidc.goslar_id');
      provider.setCustomParameters({ pkce: 'true' });
      provider.addScope('offline_access email profile openid');

      const result = await signInWithPopup(this.auth, provider);

      // Extract and store the Goslar-ID access token for downstream API use
      const credential = OAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        this.oidcAccessTokenSubject.next(credential.accessToken);
      }

      return result;
    } catch (error: any) {
      throw this.handleAuthError(error);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      this.loadingSubject.next(true);
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async updateUserProfile(updates: { displayName?: string; photoURL?: string }): Promise<void> {
    try {
      const user = this.currentUser;
      if (!user) throw new Error('Kein Benutzer angemeldet');
      await updateProfile(user, updates);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  private handleAuthError(error: any): AuthError {
    let message: string;

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'Diese E-Mail-Adresse ist bereits registriert.';
        break;
      case 'auth/weak-password':
        message = 'Das Passwort ist zu schwach. Bitte wähle ein stärkeres Passwort.';
        break;
      case 'auth/invalid-email':
        message = 'Bitte gib eine gültige E-Mail-Adresse ein.';
        break;
      case 'auth/user-not-found':
        message = 'Kein Konto mit dieser E-Mail-Adresse gefunden.';
        break;
      case 'auth/wrong-password':
        message = 'Falsches Passwort. Bitte versuche es erneut.';
        break;
      case 'auth/too-many-requests':
        message = 'Zu viele fehlgeschlagene Versuche. Bitte versuche es später erneut.';
        break;
      case 'auth/network-request-failed':
        message = 'Netzwerkfehler. Bitte überprüfe deine Internetverbindung.';
        break;
      case 'auth/invalid-credential':
        message = 'Ungültige Anmeldedaten. Bitte überprüfe E-Mail und Passwort.';
        break;
      case 'auth/popup-closed-by-user':
        message = 'Anmeldung abgebrochen.';
        break;
      default:
        message = error.message || 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.';
    }

    return { code: error.code ?? 'unknown-error', message };
  }
}
