pragma solidity ^0.4.0;

contract Liek {
    
    mapping (bytes32 => bool) has_lieked;
    mapping (bytes32 => uint64) num_lieks;
    
    function liek(string url) external {
        bytes32 id = keccak256(msg.sender, url);
        bool l = has_lieked[id];
        require(!l);
        
        bytes32 page_id = keccak256(url);
        has_lieked[id] = true;
        num_lieks[page_id]++;
    }
    
    function liekCount(string url) public view returns (uint64) {
        bytes32 page_id = keccak256(url);
        return num_lieks[page_id];
    }
    
}