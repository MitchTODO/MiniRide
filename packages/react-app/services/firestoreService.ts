// firestoreService.ts
import { db } from './firebaseConfig';
import { collection, addDoc } from "firebase/firestore";

export interface RideEntry {
  txHash: string;
  requestId: string;
  requester:string;
  amount: string;
  endpoint:{lat:number,lng:number},
  startpoint:{lat:number,lng:number},
}

const postDataToFirestore = async (data: RideEntry) => {
  try {
    const docRef = await addDoc(collection(db, "rides"), data);
    alert(docRef.id)
    console.log("Document written with ID: ", docRef.id);
    return true
  } catch (e) {
    alert(e)
    console.error("Error adding document: ", e);
    return false
  }
};

export { postDataToFirestore };
