// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Business {
    // Struct to store business details
    struct Bus {
        bool isVerified;
        uint256 timeCreated;
        bytes32 country;
        bytes32 city;
        string metaURI;
    }

    // Events for business actions
    event BusinessRegistered(address indexed businessAddress, string meta);
    event BusinessVerified(address indexed businessAddress);
    event BusinessRemoved(address indexed businessAddress);

    // Contract owner and base meta URI
    address public owner;
    string public baseMetaURI;

    // Mapping to store businesses by address
    mapping(address => Bus) private businesses;

    // Mapping to store business addresses by city hash
    mapping(bytes32 => address[]) private citiesToBusiness;

    // Modifier to check if the caller is the contract owner
    modifier onlyContractOwner() {
        require(msg.sender == owner, "Must be contract owner");
        _;
    }

    // Modifier to check if the caller is the owner of a specific business
    modifier onlyBusinessOwner(address id) {
        require(id == msg.sender, "Must be Business owner");
        _;
    }

    // Constructor to initialize the contract
    constructor(string memory _baseMetaURI) {
        baseMetaURI = _baseMetaURI;
        owner = msg.sender;
    }

    // Function to register a new business
    function registerBusiness(
        uint _country,
        string memory _city,
        bytes32 _metaHash,
        string memory _metaURI
    ) public {
        // Ensure the business does not already exist
        require(businesses[msg.sender].timeCreated == 0, "Business already registered");

        // Create a new Business struct
        Bus memory business;
        business.metaURI = _metaURI;
        business.country = bytes32(_country);
        business.city = keccak256(abi.encodePacked(_city)); // Convert city to bytes32 hash
        business.isVerified = false;
        business.timeCreated = block.timestamp;
        businesses[msg.sender] = business;

        // Generate hash for location
        bytes32 locationHash = keccak256(abi.encodePacked(_country, _city));
        // Add business to city mapping
        citiesToBusiness[locationHash].push(msg.sender);

        // Emit event for business registration
        emit BusinessRegistered(msg.sender, _metaURI);
    }

    // Function to verify a business
    function verifyBusiness(address _owner) public onlyContractOwner {
        require(businesses[_owner].timeCreated != 0, "Business does not exist");
        businesses[_owner].isVerified = true;
        emit BusinessVerified(_owner);
    }

    // Function to remove a business
    function removeBusiness(uint256 _country, string memory _city, address _owner) public onlyBusinessOwner(_owner) {
        require(businesses[_owner].timeCreated != 0, "Business does not exist");

        bytes32 locationHash = keccak256(abi.encodePacked(_country, _city));
        address[] storage businessesInCity = citiesToBusiness[locationHash];

        for (uint256 i = 0; i < businessesInCity.length; i++) {
            if (businessesInCity[i] == _owner) {
                // Replace the business to be removed with the last business in the array
                businessesInCity[i] = businessesInCity[businessesInCity.length - 1];
                // Remove the last business from the array
                businessesInCity.pop();
                break;
            }
        }

        // Delete the business record
        delete businesses[_owner];
        // Emit event for business removal
        emit BusinessRemoved(_owner);
    }
}
