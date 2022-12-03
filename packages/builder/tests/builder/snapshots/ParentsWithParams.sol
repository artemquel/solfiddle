pragma solidity ^0.8.9;

import "path/to/parent/contract1.sol";
import "path/to/parent/contract2.sol";

contract TestContract is ParentContract1, ParentContract2 {
    constructor() ParentContract1(15, 30) ParentContract2("stringArg") {}
}