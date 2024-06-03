import React, { useState } from 'react';
import { setUpRecaptcha, sendVerificationCode, verifyCode } from '../services/authService';

type PhoneAuthComponent = {
  handleGoogleLogin:() => void;
};

const PhoneAuthComponent: React.FC<PhoneAuthComponent> = ({handleGoogleLogin}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  const handleSendCode = async () => {
    setUpRecaptcha("recaptcha-container");
    try {
      const result = await sendVerificationCode(phoneNumber);
      setConfirmationResult(result);
    } catch (error) {
        alert("Error during sending verification code:", error)
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmationResult) return;
    try {
      await verifyCode(confirmationResult, code);
      handleGoogleLogin();
    } catch (error) {
      console.error("Error during verifying code:", error);
      return false
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <input
        type="text"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Enter phone number"
        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSendCode}
        className="px-4 py-2 font-semibold text-white bg-green-500 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
      >
        Send Code
      </button>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter verification code"
        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleVerifyCode}
        className="px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Verify Code
      </button>
      <div id="recaptcha-container" className="mt-4"></div>
    </div>
  );
};

export default PhoneAuthComponent;
