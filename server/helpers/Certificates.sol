pragma solidity 0.4.24;

contract Certificates {
    struct certificate {
        string courseName;
        string userName;
        string timestamp;
        uint marksObtained;
        uint totalQuestions;
        string headlessHash;
        string clientHash;
    }
    mapping (address => certificate[]) public certificates;
    address[] public userAcnts;
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender==owner);
        _;
    }
    constructor() public {
        owner=msg.sender;
    }
    
    function addCertificate(address userAddr, string courseName,string userName,string timestamp,uint marksObtained, uint totalQuestions, string headlessHash, string clientHash) onlyOwner  public {
        certificate[] storage currentUser = certificates[userAddr];
        certificate memory newCerti;
        newCerti.courseName=courseName;
        newCerti.userName=userName;
        newCerti.timestamp=timestamp;
        newCerti.marksObtained=marksObtained;
        newCerti.totalQuestions=totalQuestions;
        newCerti.headlessHash=headlessHash;
        newCerti.clientHash=clientHash;
        if (!userExists(userAddr)){
            userAcnts.push(userAddr);
        }
        currentUser.push(newCerti);
    }
    function getUserCount() view public returns(uint){
        return userAcnts.length;
    }
    function getUserCertiCount(address user) view public returns(uint) {
        return certificates[user].length;
    }
    function getCertificate(address user,uint i) view public returns(string,string,string,uint,uint,string,string){
        certificate[] memory currentUser = certificates[user];
        certificate memory currCerti = currentUser[i];
        return (currCerti.courseName,currCerti.userName,currCerti.timestamp,currCerti.marksObtained,currCerti.totalQuestions,currCerti.headlessHash,currCerti.clientHash);
    }
    function userExists(address user) public view returns(bool) {
        for(uint i=0;i<userAcnts.length;i++){
            if (user==userAcnts[i]){
                return true;
            }
        }
        return false;
    }
}