// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MultiSig.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // Importing OpenZeppelin's ERC20 interface

/**
 * @title TransportAndDelivery
 * @dev This contract facilitates the creation and management of delivery requests.
 * It includes multi-signature functionality for secure transaction confirmation.
 * THIS CONTRACT IS A WORK IN PROGRESS
 */
contract TransportAndDelivery {

    IERC20 public cUSDToken; // This will hold the cUSD token contract address

    // Struct to represent a delivery request
    struct Request {
        address requester;
        address courier;
        uint256 paymentAmount;
        uint256 txIndex;
        bool completed;
    }

    // Struct to represent multi-signature transaction data
    struct MultiSig {
        uint required; // Number of required confirmations
        bool executed; // Whether the transaction has been executed
        bytes32 txHash; // Hash of the transaction
        address[] owners; // Addresses of the owners
    }

    // Struct to represent confirmation data for owners
    struct Confirmation {
        bool isOwner; // Whether the address is an owner
        bool isConfirmed; // Whether the transaction is confirmed by the owner
    }
    
    mapping(uint256 => Request) public requests; // Mapping of request ID to Request struct
    uint256 public requestCount; // Counter for request IDs

    mapping(uint256 => MultiSig) public sigs; // Mapping of request ID to MultiSig struct
    mapping(uint => mapping(address => Confirmation)) public confirmations; // Nested mapping for confirmations

    // Events for logging
    event RequestCreated(uint256 requestId, address requester, uint256 paymentAmount);
    event RequestAccepted(uint256 requestId, address courier);
    event RequestCompleted(uint256 requestId);
    event RequestConfirm(uint256 requestId);
    event RequestPayout(uint256 requestId);

    /**
     * @dev Constructor to initialize the cUSD token contract address
     * @param _erc20 Address of the cUSD token contract
     */
    constructor(address _erc20) {
        cUSDToken = IERC20(_erc20); // Initialize cUSD token contract
    }

    /**
     * @dev Function to create a new delivery request
     * @param _paymentAmount Amount to be paid for the delivery
     */
    function createRequest(uint256 _paymentAmount) public {
        require(cUSDToken.allowance(msg.sender, address(this)) >= _paymentAmount, "Insufficient Allowance");
        require(cUSDToken.transferFrom(msg.sender, address(this), _paymentAmount), "Transfer Failed");

        address[] memory _owners = new address[](2);
        _owners[0] = msg.sender; // requester
        _owners[1] = address(0); // service provider to be set later

        requestCount++;
        sigs[requestCount] = MultiSig({
            required: 1, // Only one signature for approval for simplicity
            executed: false,
            txHash: 0,
            owners: _owners
        });

        // Add owner to multiSig for request 
        confirmations[requestCount][msg.sender].isOwner = true;
        
        requests[requestCount] = Request({
            requester: msg.sender,
            courier: address(0),
            paymentAmount: _paymentAmount,
            txIndex: 0,
            completed: false
        });

        emit RequestCreated(requestCount, msg.sender, _paymentAmount);
    }

    /**
     * @dev Function for a courier to accept a delivery request
     * @param _requestId ID of the request to accept
     */
    function acceptRequest(uint256 _requestId) public {
        Request storage req = requests[_requestId];
        MultiSig storage sig = sigs[_requestId];
        require(req.courier == address(0), "Request already accepted");
        
        // Set the courier for the request
        req.courier = msg.sender;

        // Update owner array in multiSig
        address[] memory _owners = sig.owners;
        _owners[1] = msg.sender;
        sig.owners = _owners;
 
        // Add courier to multiSig owners
        confirmations[requestCount][msg.sender].isOwner = true;
        
        emit RequestAccepted(_requestId, msg.sender);
    }

    /**
     * @dev Function for a courier to mark a request as completed
     * @param _requestId ID of the request to complete
     */
    function completeRequest(uint256 _requestId) public {
        Request storage req = requests[_requestId];
        require(req.courier == msg.sender, "Only courier can complete the request");
        require(!req.completed, "Request already completed");

        // Mark the request as completed and confirm by courier
        req.completed = true;
        confirmations[requestCount][msg.sender].isConfirmed = true;

        emit RequestCompleted(_requestId);
    }

    /**
     * @dev Function for the requester to confirm the completion of a request
     * @param _requestId ID of the request to confirm
     */
    function confirmRequest(uint256 _requestId) public {
        Request storage req = requests[_requestId];
        require(req.requester == msg.sender, "Only requester can confirm the request");
        require(req.completed, "Request should be completed by courier");

        // Confirm the request by the requester
        confirmations[requestCount][msg.sender].isConfirmed = true; 

        emit RequestConfirm(_requestId);
    }

    /**
     * @dev Function to payout the courier after request confirmation
     * @param _requestId ID of the request to payout
     */
    function payout(uint256 _requestId) external {
        // Retrieve multi-signature information
        MultiSig storage sig = sigs[_requestId];

        // Checks
        require(!sig.executed, "Transaction already executed");
        require(isConfirmed(_requestId, sig.required, sig.owners), "Transaction not confirmed by required number of owners");
        
        // Update state before external calls
        sig.executed = true;
        sig.txHash = blockhash(block.number - 1); // Use the hash of the last confirmed block

        // Retrieve request information
        Request memory req = requests[_requestId];
        
        // Interaction
        bool success = cUSDToken.transfer(req.courier, req.paymentAmount);
        require(success, "Transfer failed");

        emit RequestPayout(_requestId);
    }

    /**
     * @dev Internal function to check if a request has been confirmed by required number of owners
     * @param _requestId ID of the request
     * @param _required Number of required confirmations
     * @param _owners Array of owner addresses
     * @return bool indicating whether the request is confirmed
     */
    function isConfirmed(uint256 _requestId, uint256 _required, address[] memory _owners) private view returns (bool) {
        uint count = 0;
        for (uint i = 0; i < _owners.length; i++) {
            if (confirmations[_requestId][_owners[i]].isConfirmed) {
                count += 1;
            }
        }
        return count >= _required;
    }

    // TODO Handle request cancellations from both parties
    // MultiSig allows for dispute resolution if needed
    function cancelRequest(uint256 requestId) public {
        // Implementation needed
    }
}
