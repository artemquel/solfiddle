pragma solidity ^0.8.9;

contract TestContract {
    function simpleFunction() public pure override returns () {
        uint256 a = 256;
        return super.simpleFunction();
    }
}
