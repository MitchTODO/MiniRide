// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

/**
 * @title OrderManagement
 * @dev This contract manages orders, including their states and details. It provides functionality for submitting, canceling, and changing the state of orders.
 */
contract OrderManagement {

    Order[] private _orders; // Array to store all orders
    mapping(bytes32 => uint256) private _orderIndexMap; // Mapping to store order ID to index in the _orders array
    uint256 private _orderCount = 0; // Counter for the number of orders

    // Enum to represent the state of an order
    enum State {
        submitted,
        accepted,
        inroute,
        delivered,
        confirmed,
        canceled
    }

    // Struct to represent an order
    struct Order {
        bytes32 id; // Order ID
        State state; // State of the order
        address origin; // Address of the order origin
        address destination; // Address of the order destination
        uint256 price; // Price of the order
        uint256 timeStamp; // Timestamp of the order creation
        address resolver; // Address of the resolver (driver)
        bool resolved; // Whether the order is resolved
        string meta; // Additional metadata for the order
    }

    // Events for logging order actions
    event OrderSubmitted(bytes32 indexed orderId);
    event OrderStateChanged(bytes32 indexed orderId, State newState);

    // Modifier to check if the sender is the owner of the order
    modifier onlyOwner(bytes32 orderId) {
        Order memory order = getOrder(orderId);
        require(msg.sender == order.origin, "Must be origin order owner");
        _;
    }

    /**
     * @dev Function to get the details of an order
     * @param orderId ID of the order to retrieve
     * @return Order struct containing the order details
     */
    function getOrder(bytes32 orderId)
    public
    view
    returns(Order memory)
    {
        uint256 indexHash = _orderIndexMap[orderId];
        return _orders[indexHash];
    }

    // TODO handle payout when order is canceled
    /**
     * @dev Function to cancel an order
     * @param orderId ID of the order to cancel
     */
    function cancelOrder(bytes32 orderId)
    public
    onlyOwner(orderId)
    {
        uint256 index = _orderIndexMap[orderId];
        Order memory order = _orders[index];
        order.state = State.canceled;
        _orders[index] = order;
        emit OrderStateChanged(orderId, State.canceled);
    }

    /**
     * @dev Function to submit a new order
     * @param _destination Address of the order destination
     * @param _price Price of the order
     * @param _meta Additional metadata for the order
     */
    function submitOrder(address _destination, uint256 _price, string memory _meta)
    public
    payable
    {
        Order memory order;
        order.origin = msg.sender;
        order.destination = _destination;
        order.price = _price;
        order.timeStamp = block.timestamp;
        order.resolver = address(0);
        order.resolved = false;
        order.meta = _meta;

        bytes32 locationHash = keccak256(abi.encodePacked(msg.sender, _destination, _price, block.timestamp, _meta));
        // Keep track of order index
        _orderIndexMap[locationHash] = _orderCount;

        _orders.push(order);
        _orderCount += 1;

        emit OrderSubmitted(locationHash);
    }

    // Modifier to check the current state and the new state
    modifier checkState(bytes32 orderId, State _newState) 
    {
        uint256 index = _orderIndexMap[orderId];
        Order memory order = _orders[index];
        if(order.state == State.submitted){
            require(_newState == State.accepted, "Invalid state transition");
        } else if(order.state == State.accepted) {
            // TODO finish state rules
        }
        _;
    }

    /**
     * @dev Function to change the state of an order
     * @param orderId ID of the order to change the state for
     * @param _newState New state to change to
     */
    function changeOrderState(bytes32 orderId, State _newState)
    public
    {
        uint256 index = _orderIndexMap[orderId];
        Order memory order = _orders[index];
        order.state = _newState;
        _orders[index] = order;
        emit OrderStateChanged(orderId, _newState);
    }

    /*
    // Function to accept an order
    function acceptOrder(bytes32 orderId)
    public
    {
        uint256 index = _orderIndexMap[orderId];
        Order memory order = _orders[index];
        order.state = State.accepted;
        _orders[index] = order;
        emit OrderStateChanged(orderId, State.accepted);
    }

    // Function to mark an order as picked up
    function pickedUp(bytes32 orderId)
   
