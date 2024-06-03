import { useEffect, useState } from "react";

import { getContract, formatEther, createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import { stableTokenABI } from "@celo/abis";
import { useAccount } from "wagmi";

import {TransportAndDelivery, cUSDContract} from "./Utils/ContractABI";
import {TD_Main, STABLE_TOKEN_ADDRESS} from "./Utils/Network";
import {getCUSDBalance} from "./Utils/ContractCalls";

import styles from "./cMapStyles";

//import * as GoogleSignIn from 'expo-google-sign-in';
//import firebase from '../firebaseConfig';
//import { GoogleMap, useJsApiLoader,InfoWindow ,Marker, LatLng} from '@react-google-maps/api';
import CMapView from "./cMapView";
//import {checkCUSDBalance} from './Utils/ContractCalls';

// Define a type for the props
type Requests = {
    address: string;
  };

const Requests: React.FC<Requests> = ({address}) => {
    const RequestType = {
        RIDE: 'Request A Ride',
        ITEM: 'Find a item to Purchase',
      };

    const [showMap, setMapForBusiness] = useState("");
    const [userBalance, setUserBalance] = useState("");
    const [view, setMapView] = useState(<p>No Map</p>)

    const backButtonStyle = {
        left: '10px',
        fontSize: '16px',
        cursor: 'pointer',
        border: 'none',
        background: 'none'
      };

      const headerStyle = {
        display: 'flex',
        alignItems: 'center', // Aligns items vertically center
        justifyContent: 'space-between', // Distributes space between and around content items
        width: '100%',
     
        height: '50px',
        background: '#f8f9fa',
        borderBottom: '1px solid #ccc',
      };

      const titleStyle = {
        fontSize: '18px',
        fontWeight: 'bold',
      };
      useEffect(() => {
        getUserBalance()
        }, []);
        
    const getUserBalance = async () => {
        const balance = await getCUSDBalance(address)
        setUserBalance(balance.toString());
    }

    const sendRequest = async () => {
        alert("Send Request")
        return true;
    };

    const showMapToRequestType = (type) => {
        if(type == RequestType.ITEM) {
            setMapView(<div>ITEM</div>)
            setMapForBusiness(RequestType.ITEM)
            
        }else {
            setMapView(<CMapView
                sendRequest={sendRequest}
                balance = {userBalance}
                />)
            setMapForBusiness(RequestType.RIDE)
        }
    }

    return (
        <div className="flex flex-col justify-center items-center">
            { (showMap === "") ? (
                    <div>
                         <button className="px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-700" title="Request A Ride" onClick={() => showMapToRequestType(RequestType.RIDE) } >Request A Ride</button>
                         <button className="px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-700" title="Request A Item" onClick={() => showMapToRequestType(RequestType.ITEM) } >Request A Item</button>
                    </div>
            ) :
                (
                    <div>
                        <div style={headerStyle}>
                            <button onClick={() => setMapForBusiness("")} style={backButtonStyle}>Back</button>
                            <div style={titleStyle}>{showMap}</div>
                            <div className="flex flex-row justify-center items-center">
                                <img className="mr-2" style={styles.stableIconSmall} src="../cUSDBlack.png" alt="My Image" />
                                <div>{userBalance}</div>
                            </div>
                        </div>
                       
                        {view}
                    </div>  
                )
            }
        </div>
    );
    
}




export default Requests