// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MultiSigC
 * @dev Manages multi-signature token transactions
 * CONTRACT IS A WORK IN PROGRESS
 * TODO: Add contract ownership from TransportAndDelivery
 */
contract MultiSigC {
    IERC20 public token; // cUSD token interface
    address[] private owners;
    uint private required;
    mapping(address => bool) private isOwner;

    struct Transaction {
        address to;
        uint value;
        bool executed;
    }

    Transaction[] private transactions;
    mapping(uint => mapping(address => bool)) private confirmations;

    /**
     * @dev Constructor to initialize the multi-signature wallet
     * @param _owners Array of owner addresses
     * @param _required Number of required confirmations for a transaction
     * @param _tokenAddress Address of the cUSD token contract
     */
    constructor(address[] memory _owners, uint _required, address _tokenAddress) {
        require(_owners.length > 0, "Owners required");
        require(_required > 0 && _required <= _owners.length, "Invalid number of required confirmations");
        token = IERC20(_tokenAddress); // Initialize the cUSD token contract

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }

        required = _required;
    }

    /**
     * @dev Submits a new transaction
     * @param _to Address to send the tokens to
     * @param _value Amount of tokens to send
     * @return txIndex Index of the submitted transaction
     */
    function submitTransaction(address _to, uint _value) public returns (uint256 txIndex) {
        txIndex = transactions.length;
        transactions.push(Transaction({
            to: _to,
            value: _value,
            executed: false
        }));
        return txIndex;
    }

    /**
     * @dev Confirms a transaction
     * @param _txIndex Index of the transaction to confirm
     */
    function confirmTransaction(uint _txIndex) public {
        require(isOwner[msg.sender], "Only owners can confirm transactions");
        Transaction storage transaction = transactions[_txIndex];
        require(!transaction.executed, "Transaction already executed");
        require(!confirmations[_txIndex][msg.sender], "Transaction already confirmed");

        confirmations[_txIndex][msg.sender] = true;
    }

    /**
     * @dev Executes a confirmed transaction
     * @param _txIndex Index of the transaction to execute
     */
    function executeTransaction(uint _txIndex) public {
        Transaction storage transaction = transactions[_txIndex];
        require(!transaction.executed, "Transaction already executed");
        require(isConfirmed(_txIndex), "Transaction not confirmed by required number of owners");

        transaction.executed = true;
        bool success = token.transfer(transaction.to, transaction.value);
        require(success, "Token transfer failed");
    }

    /**
     * @dev Checks if a transaction is confirmed by the required number of owners
     * @param _txIndex Index of the transaction to check
     * @return bool indicating whether the transaction is confirmed
     */
    function isConfirmed(uint _txIndex) private view returns (bool) {
        uint count = 0;
        for (uint i = 0; i < owners.length; i++) {
            if (confirmations[_txIndex][owners[i]]) {
                count += 1;
            }
        }
        return count >= required;
    }
}
