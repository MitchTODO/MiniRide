import React, { useEffect, useState } from 'react';
import { database } from '@/services/firebaseConfig'; // Update the path as necessary
import { ref, onValue } from 'firebase/database';
import { acceptRequest, completeRequest, getCUSDBalance, payout, } from "@/pages/Utils/ContractCalls";
import { useAccount } from "wagmi";
//import { useRouter } from 'next/router';

import { ethers } from 'ethers';
import { RealTimeRideEntry, addEntryToRealtimeDatabase } from '@/services/realtimeService';

interface RideRequest {
  type: 'ride';
  name:string;
  txHash: string;
  requestId: string;
  endpoint:{lat:number,lng:number},
  startpoint:{lat:number,lng:number},
  price: number;
  driver: string;
  status: string;
}

interface FoodDelivery {
  requestId: string;
  type: 'food';
  restaurant: string;
  deliveryAddress: string;
  price: number;
  name:string;
  txHash:string;
  status: string;
}

type Request = RideRequest | FoodDelivery;

const DriverRequests: React.FC = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [selectedRequest, setSelectedRequest] = useState("");
    const [userAddress, setUserAddress] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    const { address, isConnected } = useAccount();
  //const router = useRouter();



  useEffect(() => {
    const rideRequestsRef = ref(database, 'rides/');
    const foodDeliveryRef = ref(database, 'deliveries/');



    const fetchData = (ref: any, type: 'ride' | 'food') => {
      onValue(ref, (snapshot) => {
        const data = snapshot.val();
        if (data) {
        
          const requests = Object.keys(data).map(key => ({
            id: key,
            type,
            ...data[key]
          }));
          console.log(requests)
          setRequests(prevRequests => [ ...requests]);
        }
      });
    };

    // Fetch ride requests
    fetchData(rideRequestsRef, 'ride');

    // Fetch food deliveries
    fetchData(foodDeliveryRef, 'food');

    // Cleanup function to clear previous data
    return () => setRequests([]);
  }, []);

    const handleSelectRequest = async (request) => {
        const wasAccepted = await acceptRequest(request.requestId)
        console.log(wasAccepted);
        if(wasAccepted) {
            setSelectedRequest(request.requestId);
            const realTimeRideEntry: RealTimeRideEntry = {
                requestId: request.requestId,
                name: request.name,
                txHash:request.txHash,
                endpoint: request.endpoint,
                startpoint: request.startpoint,
                price: request.price,
                driver: wasAccepted[2].toString(),
                status:"",
              };
     
            const realTimeResult = await addEntryToRealtimeDatabase(realTimeRideEntry);
            if(realTimeResult) {
                //setRequestId(requestId) // set request id to 
                //setRequest(false); 
            }
        }
    };

    const handleSelectCompleteRequest = async (request) => {
        const wasComplete = await completeRequest(request.requestId)
        
        if(wasComplete) {
            setSelectedRequest(request.requestId);
            const realTimeRideEntry: RealTimeRideEntry = {
                requestId: request.requestId,
                name: request.name,
                txHash:request.txHash,
                endpoint: request.endpoint,
                startpoint: request.startpoint,
                price: request.price,
                driver: request.driver,
                status:"Completed",
              };
     
            const realTimeResult = await addEntryToRealtimeDatabase(realTimeRideEntry);
            if(realTimeResult) {
                //setRequestId(requestId) // set request id to 
                //setRequest(false); 
            }
        }
        
    };

    const handleSelectClaimFunds = async (request) => {
        const wasComplete = await payout(request.requestId)
        alert(wasComplete[0])
    };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Incoming Requests</h1>
      {requests.length === 0 ? (
        <p>No incoming requests</p>
      ) : (
        <ul>
          {requests.map(request => (
            <li key={request.requestId} className="border p-4 mb-2">
            <p><strong>RequestId:</strong> {request.requestId}</p>
              {request.type === 'ride' ? (
                <>
                  <p><strong>Type:</strong> Ride Request</p>
                  <p><strong>Pickup Location:</strong>lat: {request.startpoint.lat} long: {request.startpoint.lng}</p>
                  <p><strong>Destination:</strong>lat: {request.endpoint.lat} long: {request.startpoint.lng}</p>
                </>
              ) : (
                <>
                  <p><strong>Type:</strong> Food Delivery</p>
                  <p><strong>Restaurant:</strong> {request.restaurant}</p>
                  <p><strong>Delivery Address:</strong> {request.deliveryAddress}</p>
                </>
              )}
              <p><strong>Price:</strong> ${ethers.utils.formatEther(request.price).toString()}</p>
              <p><strong>Status:</strong>False</p>
              <p><strong>name:</strong> {request.name}</p>
              <p><strong>TX:</strong> <a  target="_blank" href={`https://explorer.celo.org/mainnet/tx/${request.txHash}`}> {request.txHash}</a></p>

            
              {request.requestId === selectedRequest ? (
                    <div>
                    {request.status === "Payout" ? (
                        <button 
                        onClick={() => handleSelectClaimFunds(request)}
                        className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
                        >
                        Claim Funds
                        </button>
                    ):(
                        <button 
                        onClick={() => handleSelectCompleteRequest(request)}
                        className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
                        >
                        Complete Ride
                        </button>
                    )}
                </div>
              ) : (
                <>
                <button 
                onClick={() => handleSelectRequest(request)}
                className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
                >
                Select
                </button>
                </>
              )}

            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DriverRequests;
