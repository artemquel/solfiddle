pragma solidity ^0.8.9;

import "contracts/Contract.sol";
import "libs/Lib.sol";

contract TestContract is Contract {
    using Library for Library.Data;

    uint256 totalAmount;
    bool blocked;
    address owner;

    constructor(uint256 uintValue, bool blocked) {
        this.totalAmount = uintValue * 100;
        this.blocked = blocked;
        this.owner = msg.sender;
    }

    function isBlocked() public view returns (bool) {
        return this.blocked;
    }

    function updateOwner(address newOwner) public onlyOwner returns (address) {
        this.owner = newOwner;
        return this.owner;
    }
}
