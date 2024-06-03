import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import LoginScreen from "./login";
import Requests from "./requests";
import { getPhoneNumber } from "@/services/resolveMiniPayPhoneNumber";

export default function Home() {

    const [userAddress, setUserAddress] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    const { address, isConnected } = useAccount();
    const [isLoggedIn, setLoggedIn] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isConnected && address) {
            setUserAddress(address);
            getPhoneNumber(address);
        }
    }, [address, isConnected,setLoggedIn, isLoggedIn]);

    if (!isMounted) {
        return null;
    }

    const handleGoogleLogin = () => {
        setLoggedIn(true)
    }

    const renderButton = () => {
        if(isConnected) {
            if(isLoggedIn) {
                return (<Requests
                    address = {userAddress}
                />)
            }else {
                return (<LoginScreen
                    address = {userAddress}
                    handleGoogleLogin = {handleGoogleLogin}
                />)
            }
        }else{
            <div>No Wallet Connected</div>
        }
    }

    return (
        <div className="flex flex-col justify-center items-center">
            {renderButton()}
        </div>
    );
}
