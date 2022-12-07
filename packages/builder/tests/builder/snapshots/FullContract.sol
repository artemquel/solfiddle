pragma solidity ^0.8.9;

import "contracts/Contract.sol";
import "libs/Lib.sol";

contract TestContract is Contract {
    using Library for Library.Data;

    enum Stage {
        NONE,
        PENDING,
        FULFILL,
        REJECT
    }

    enum Role {
        ADMIN,
        USER,
        VIEWER
    }

    uint256 totalAmount;
    bool blocked;
    address owner;

    event Transfer(address indexed from, address indexed to, address amount);
    event Purchase(address indexed to, address amount);

    struct Proposal{
        address creator;
        uint256 blockNumber;
    }

    struct Vote{
        address voter;
        uint256 blockNumber;
    }

    constructor(uint256 uintValue, bool blocked) {
        this.totalAmount = uintValue * 100;
        this.blocked = blocked;
        this.owner = msg.sender;
    }

    modifier onlyOwner(){
        _;
    }

    function isBlocked() public view returns (bool) {
        return this.blocked;
    }

    function updateOwner(address newOwner) public onlyOwner returns (address) {
        this.owner = newOwner;
        return this.owner;
    }
}
