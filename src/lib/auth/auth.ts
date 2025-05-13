import { auth, firestore } from '$lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  deleteUser,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type UserCredential
} from 'firebase/auth';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export interface AuthResponse {
  success: boolean;
  message: string;
  code?: string;
}

class FirekitAuth {
  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true, message: 'Successfully signed in' };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to sign in',
        code: error.code
      };
    }
  }

  /**
   * Register with email and password
   */
  async registerWithEmail(
    email: string,
    password: string,
    displayName?: string
  ): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Create user document in Firestore
      await this.createUserDocument(userCredential);
      
      return { success: true, message: 'Successfully registered' };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to register',
        code: error.code
      };
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Create or update user document in Firestore
      await this.createUserDocument(userCredential);
      
      return { success: true, message: 'Successfully signed in with Google' };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to sign in with Google',
        code: error.code
      };
    }
  }

  /**
   * Create or update user document in Firestore
   */
  private async createUserDocument(userCredential: UserCredential) {
    const { user } = userCredential;
    const userRef = doc(firestore, 'users', user.uid);
    
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        provider: user.providerData[0]?.providerId || 'unknown'
      },
      { merge: true }
    );
  }

  /**
   * Log out the current user
   */
  async logOut(): Promise<AuthResponse> {
    try {
      await signOut(auth);
      return { success: true, message: 'Successfully signed out' };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to sign out',
        code: error.code
      };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<AuthResponse> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent' };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to send password reset email',
        code: error.code
      };
    }
  }

  /**
   * Update user password (requires reauthentication)
   */
  async updateUserPassword(newPassword: string, currentPassword: string): Promise<AuthResponse> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        return { success: false, message: 'No user is currently signed in' };
      }

      // Reauthenticate user before updating password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      return { success: true, message: 'Password updated successfully' };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to update password',
        code: error.code
      };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profile: { displayName?: string; photoURL?: string }): Promise<AuthResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, message: 'No user is currently signed in' };
      }

      await updateProfile(user, profile);
      
      // Update Firestore document
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(
        userRef,
        {
          ...profile,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      
      return { success: true, message: 'Profile updated successfully' };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to update profile',
        code: error.code
      };
    }
  }

  /**
   * Send email verification to the current user
   */
  async sendEmailVerificationToUser(): Promise<AuthResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, message: 'No user is currently signed in' };
      }

      await sendEmailVerification(user);
      return { success: true, message: 'Verification email sent' };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to send verification email',
        code: error.code
      };
    }
  }

  /**
   * Delete user account
   */
  async deleteUserAccount(): Promise<AuthResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, message: 'No user is currently signed in' };
      }

      // Delete Firestore document
      const userRef = doc(firestore, 'users', user.uid);
      await deleteDoc(userRef);
      
      // Delete user authentication account
      await deleteUser(user);
      
      return { success: true, message: 'Account deleted successfully' };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to delete account',
        code: error.code
      };
    }
  }
}

// Create singleton instance
export const firekitAuth = new FirekitAuth(); 