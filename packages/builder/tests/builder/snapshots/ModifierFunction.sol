pragma solidity ^0.8.9;

contract TestContract {
    modifier isBigger(uint256 a, uint256 b){
        require(a > b, "b less than a");
        _;
    }
}
