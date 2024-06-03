
import { getContract, formatEther,parseEther, createPublicClient, http, encodeFunctionData } from "viem";
import { celo } from "viem/chains";
import { createWalletClient, custom } from "viem";
import { stableTokenABI } from "@celo/abis";
import { useAccount } from "wagmi";
import {ethers} from "ethers";

import {TransportAndDeliveryContract} from "./ContractABI";
import {TD_Main} from "./Network";

const publicClient = createPublicClient({
    chain: celo,
    transport: http(),
  }); // Mainnet

const STABLE_TOKEN_ADDRESS = "0x765de816845861e75a25fca122bb6898b8b1282a";

const fixTestPrice = parseEther('0.01');

export async function getCUSDBalance(address) {
    try {
        const STABLE_TOKEN_ADDRESS = "0x765de816845861e75a25fca122bb6898b8b1282a"; // Hardcoded address

        const StableTokenContract = getContract({
            address: STABLE_TOKEN_ADDRESS,
            abi: stableTokenABI,
            client: publicClient, 
          })
        
        // Properly calling the balanceOf function
        let balanceInBigNumber = await StableTokenContract.read.balanceOf([
            address,
          ]);
        
        // Debugging: Check if balance is fetched
        if (!balanceInBigNumber) {
            alert('Failed to fetch balance.');
            return;
        }

        //let balanceInWei = balanceInBigNumber.toString();

        let balanceInEthers = formatEther(balanceInBigNumber);
        let roundedBalance = parseFloat(balanceInEthers).toFixed(2);
        return roundedBalance;
    } catch (error) {
        alert(`Error fetching balance: ${error.message || error.toString()}`);

    }
}

export async function approveAmount() {

    const client = createWalletClient({
        chain: celo,
        transport: custom(window.ethereum),
      });
      
      const [address] = await client.getAddresses();
    try{
        
        let hash = await client.sendTransaction({
            to: STABLE_TOKEN_ADDRESS,
            data: encodeFunctionData({
                abi: stableTokenABI, // Token ABI can be fetched from Explorer.
                functionName: "approve",
                args: [
                    TD_Main,
                    fixTestPrice,
                ],
            }),
            // If the wallet is connected to a different network then you get an error.
            chain: celo,
            account: address,
            feeCurrency: STABLE_TOKEN_ADDRESS, // Wow, use cUSD for tx fee!
        });

        const transaction = await publicClient.waitForTransactionReceipt({
            hash, // Transaction hash that can be used to search transaction on the explorer.
          });
        
          if (transaction.status === "success") {
            return true
          } else {
            return false
          }
    } catch(error) {
        alert(`Error approving balance: ${error.message || error.toString()}`);

    }
}

export async function createRequest() {
    const client = createWalletClient({
        chain: celo,
        transport: custom(window.ethereum),
      });
      const [address] = await client.getAddresses();

    try {

        let hash = await client.sendTransaction({
            to: TD_Main,
            data: encodeFunctionData({
                abi:TransportAndDeliveryContract, // Token ABI can be fetched from Explorer.
                functionName: "createRequest",
                args: [
                    fixTestPrice,
                ],
            }),
            // If the wallet is connected to a different network then you get an error.
            chain: celo,
            account: address,
            feeCurrency: STABLE_TOKEN_ADDRESS, // Wow, use cUSD for tx fee!
        });
   
        const transaction = await publicClient.waitForTransactionReceipt({
            hash, // Transaction hash that can be used to search transaction on the explorer.
          });
        
          if (transaction.status === "success") {
            const eventAbi = TransportAndDeliveryContract.find(event => event.type === 'event' && event.name === 'RequestCreated'); // Replace 'YourEventName' with the actual event name

            const eventInterface = new ethers.utils.Interface([eventAbi]);
            const logs = transaction.logs.filter(log => log.address.toLowerCase() === TD_Main.toLowerCase());
            const decodedEvents = logs.map(log => eventInterface.parseLog(log));
            const outputValues = decodedEvents.map(event => event.args);
            const values = outputValues[0];
      
            return [true, hash, values[0],values[1],values[2]];
          } else {
            return [false,hash]
          }
        
    } catch(error) {
        alert(`Error submitting ride: ${error.message || error.toString()}`);
    }
}
  
export async function acceptRequest(requestId: string) {
  const client = createWalletClient({
    chain: celo,
    transport: custom(window.ethereum),
  });
  const [address] = await client.getAddresses();

try {

    let hash = await client.sendTransaction({
        to: TD_Main,
        data: encodeFunctionData({
            abi:TransportAndDeliveryContract, // Token ABI can be fetched from Explorer.
            functionName: "acceptRequest",
            args: [
              requestId,
            ],
        }),
        // If the wallet is connected to a different network then you get an error.
        chain: celo,
        account: address,
        feeCurrency: STABLE_TOKEN_ADDRESS, // Wow, use cUSD for tx fee!
    });

    const transaction = await publicClient.waitForTransactionReceipt({
        hash, // Transaction hash that can be used to search transaction on the explorer.
      });
    
      if (transaction.status === "success") {
        const eventAbi = TransportAndDeliveryContract.find(event => event.type === 'event' && event.name === 'RequestAccepted'); // Replace 'YourEventName' with the actual event name

        const eventInterface = new ethers.utils.Interface([eventAbi]);
        const logs = transaction.logs.filter(log => log.address.toLowerCase() === TD_Main.toLowerCase());
        const decodedEvents = logs.map(log => eventInterface.parseLog(log));
        const outputValues = decodedEvents.map(event => event.args);
        const values = outputValues[0];
  
        return [true, hash, address,values[0] ];
      } else {
        return [false,hash]
      }
    
} catch(error) {
    alert(`Error submitting ride: ${error.message || error.toString()}`);
 
}

}

export async function completeRequest(requestId: string) {
  const client = createWalletClient({
    chain: celo,
    transport: custom(window.ethereum),
  });
  const [address] = await client.getAddresses();

try {

    let hash = await client.sendTransaction({
        to: TD_Main,
        data: encodeFunctionData({
            abi:TransportAndDeliveryContract, // Token ABI can be fetched from Explorer.
            functionName: "completeRequest",
            args: [
              requestId,
            ],
        }),
        // If the wallet is connected to a different network then you get an error.
        chain: celo,
        account: address,
        feeCurrency: STABLE_TOKEN_ADDRESS, // Wow, use cUSD for tx fee!
    });

    const transaction = await publicClient.waitForTransactionReceipt({
        hash, // Transaction hash that can be used to search transaction on the explorer.
      });
    
      if (transaction.status === "success") {
        const eventAbi = TransportAndDeliveryContract.find(event => event.type === 'event' && event.name === 'RequestCompleted'); // Replace 'YourEventName' with the actual event name

        const eventInterface = new ethers.utils.Interface([eventAbi]);
        const logs = transaction.logs.filter(log => log.address.toLowerCase() === TD_Main.toLowerCase());
        const decodedEvents = logs.map(log => eventInterface.parseLog(log));
        const outputValues = decodedEvents.map(event => event.args);
        const eventRequestId = outputValues[0];
  
        return [true, hash ,eventRequestId[0] ];
      } else {
        return [false,hash]
      }
    
} catch(error) {
    alert(`Error submitting ride: ${error.message || error.toString()}`);
 
}
}


export async function confirmRequest(requestId: string) {
  const client = createWalletClient({
    chain: celo,
    transport: custom(window.ethereum),
  });
  const [address] = await client.getAddresses();

try {

    let hash = await client.sendTransaction({
        to: TD_Main,
        data: encodeFunctionData({
            abi:TransportAndDeliveryContract, // Token ABI can be fetched from Explorer.
            functionName: "confirmRequest",
            args: [
              requestId,
            ],
        }),
        // If the wallet is connected to a different network then you get an error.
        chain: celo,
        account: address,
        feeCurrency: STABLE_TOKEN_ADDRESS, // Wow, use cUSD for tx fee!
    });

    const transaction = await publicClient.waitForTransactionReceipt({
        hash, // Transaction hash that can be used to search transaction on the explorer.
      });
    
      if (transaction.status === "success") {
        const eventAbi = TransportAndDeliveryContract.find(event => event.type === 'event' && event.name === 'RequestConfirm'); // Replace 'YourEventName' with the actual event name

        const eventInterface = new ethers.utils.Interface([eventAbi]);
        const logs = transaction.logs.filter(log => log.address.toLowerCase() === TD_Main.toLowerCase());
        const decodedEvents = logs.map(log => eventInterface.parseLog(log));
        const outputValues = decodedEvents.map(event => event.args);
        const eventRequestId = outputValues[0];
  
        return [true, hash ,eventRequestId[0] ];
      } else {
        return [false,hash]
      }
    
} catch(error) {
    alert(`Error submitting ride: ${error.message || error.toString()}`);
 
}
}

export async function payout(requestId: string) {
  const client = createWalletClient({
    chain: celo,
    transport: custom(window.ethereum),
  });
  const [address] = await client.getAddresses();

try {

    let hash = await client.sendTransaction({
        to: TD_Main,
        data: encodeFunctionData({
            abi:TransportAndDeliveryContract, // Token ABI can be fetched from Explorer.
            functionName: "payout",
            args: [
              requestId,
            ],
        }),
        // If the wallet is connected to a different network then you get an error.
        chain: celo,
        account: address,
        feeCurrency: STABLE_TOKEN_ADDRESS, // Wow, use cUSD for tx fee!
    });

    const transaction = await publicClient.waitForTransactionReceipt({
        hash, // Transaction hash that can be used to search transaction on the explorer.
      });
    
      if (transaction.status === "success") {
        const eventAbi = TransportAndDeliveryContract.find(event => event.type === 'event' && event.name === 'RequestPayout'); // Replace 'YourEventName' with the actual event name

        const eventInterface = new ethers.utils.Interface([eventAbi]);
        const logs = transaction.logs.filter(log => log.address.toLowerCase() === TD_Main.toLowerCase());
        const decodedEvents = logs.map(log => eventInterface.parseLog(log));
        const outputValues = decodedEvents.map(event => event.args);
        const eventRequestId = outputValues[0];
  
        return [true, hash ,eventRequestId[0] ];
      } else {
        return [false,hash]
      }
    
} catch(error) {
    alert(`Error submitting ride: ${error.message || error.toString()}`);
    return[false]
 
}
}