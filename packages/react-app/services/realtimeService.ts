// realtimeService.ts
import { database } from './firebaseConfig';
import { ref, set, onValue } from 'firebase/database';

export interface RealTimeRideEntry {
    name:string;
    txHash: string;
    requestId: string;
    endpoint:{lat:number,lng:number},
    startpoint:{lat:number,lng:number},
    price: number;
    driver:string;
    status:string;
}



const addEntryToRealtimeDatabase = async (rideEntry: RealTimeRideEntry) => {
  try {
    const newEntryRef = ref(database, 'rides/' + rideEntry.requestId);
    await set(newEntryRef, rideEntry);
    console.log("Ride entry added successfully.");
    return true;
  } catch (error) {
    alert(error)
    console.error("Error adding ride entry: ", error);
    return false;
  }
};

const listenForRideChanges = (requestId: string, callback: (data: any) => void) => {
    const rideRef = ref(database, `rides/${requestId}`);
    onValue(rideRef, (snapshot) => {
      const data = snapshot.val();
      callback(data);
    });
  };

export { addEntryToRealtimeDatabase, listenForRideChanges};
