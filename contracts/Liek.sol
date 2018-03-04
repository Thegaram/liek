pragma solidity ^0.4.0;

contract Liek {
    
    mapping (bytes32 => bool) has_lieked;
    mapping (bytes32 => uint64) num_lieks;
    
    function liek(string domain, string id) external {
        bytes32 sender_id = keccak256(msg.sender, domain, id);
        bool l = has_lieked[sender_id];
        require(!l);
        
        bytes32 page_id = keccak256(domain, id);
        has_lieked[sender_id] = true;
        num_lieks[page_id]++;
    }
    
    function liekCount(string domain, string id) public view returns (uint64) {
        bytes32 page_id = keccak256(domain, id);
        return num_lieks[page_id];
    }
    
    // TODO: batch for multiple ids
    function liekCheck(string domain, string id) public view returns (bool) {
        bytes32 sender_id = keccak256(msg.sender, domain, id);
        return has_lieked[sender_id];
    }

}