pragma solidity ^0.8.9;

import "path/to/library/contract1.sol";
import "path/to/library/contract2.sol";

contract TestContract {
    using LibraryContract1 for LibraryContract1.Type;
    using LibraryContract2 for LibraryContract12.Type;
}
