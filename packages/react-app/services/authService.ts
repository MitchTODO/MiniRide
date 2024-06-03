
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from './firebaseConfig';

import { signOut } from 'firebase/auth';

export const logout = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    return false;
  }
};

export const setUpRecaptcha = (elementId: string) => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth,elementId, {
      'size': 'normal', // Use 'normal' or 'invisible' based on your requirement
      'callback': (response: any) => {
        // reCAPTCHA solved - allow user to proceed with phone number verification
        console.log("reCAPTCHA solved");
      },
      'expired-callback': () => {
        // Reset reCAPTCHA if it expires
        alert("reCAPTCHA expired")

      }
    });
  
    window.recaptchaVerifier.render().then((widgetId: any) => {
      console.log("reCAPTCHA widget rendered with ID:", widgetId);
    });
  };
  
  export const sendVerificationCode = async (phoneNumber: string) => {
    if (!window.recaptchaVerifier) {
      throw new Error("reCAPTCHA verifier is not set up");
    }
  
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      return confirmationResult;
    } catch (error) {
      console.error('Error sending verification code: ', error);
      throw error;
    }
  };
  
  export const verifyCode = async (confirmationResult: any, code: string) => {
    try {
      const result = await confirmationResult.confirm(code);
      console.log('Phone authentication successful, user:', result.user);
      return true
    } catch (error) {
      console.error('Error verifying the code: ', error);
      alert('Error verifying the code: ');
      throw error;
    }
  };