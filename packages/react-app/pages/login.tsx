import { useEffect, useState } from "react";

import { useAccount } from "wagmi";
import {signInWithGoogle} from "../services/firebaseConfig";
import PhoneAuthComponent from "./signInWithNumber";

type LoginScreen = {
    address: string;
    handleGoogleLogin:() => void;
  };

const LoginScreen:React.FC<LoginScreen> = ({handleGoogleLogin, address}) => {

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Welcome to MiniRide</h2>
          <h3 className="text-xl font-semibold mb-4 text-center">Connect your Google Account to use MiniRide.</h3>
          <p className="text font-semibold mb-4 text-center">Quick connect using Social Connect Phone Number!</p>
          <PhoneAuthComponent 
            handleGoogleLogin = {handleGoogleLogin}
          />
        </div>
      </div>
    );
    
}
export default LoginScreen