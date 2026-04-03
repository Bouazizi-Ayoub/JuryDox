// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DocumentManager.sol";
import "./JuryVoting.sol";
import "./AuditTrail.sol";

/**
 * @title JuryDoX
 * @dev Contrat principal intégrant tous les modules de JuryDoX
 */
contract JuryDoX {
    DocumentManager public documentManager;
    JuryVoting public juryVoting;
    AuditTrail public auditTrail;

    address public owner;
    mapping(address => Role) public userRoles;

    enum Role { None, Secretary, Jury, Lawyer }

    event RoleAssigned(address indexed user, Role role);
    event DocumentWorkflowStarted(uint256 indexed documentId, uint256 voteSessionId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyRole(Role _role) {
        require(userRoles[msg.sender] == _role, "Incorrect role");
        _;
    }

    constructor() {
        owner = msg.sender;

        // Deploy sub-contracts
        documentManager = new DocumentManager();
        juryVoting = new JuryVoting();
        auditTrail = new AuditTrail();

        // Authorize this contract to add audit entries
        auditTrail.authorizeContract(address(this));
    }

    function assignRole(address _user, Role _role) external onlyOwner {
        userRoles[_user] = _role;

        if (_role == Role.Secretary) {
            documentManager.addSecretary(_user);
        } else if (_role == Role.Jury) {
            documentManager.addJuryMember(_user);
            juryVoting.addJuryMember(_user);
        } else if (_role == Role.Lawyer) {
            documentManager.addLawyer(_user);
        }

        auditTrail.addAuditEntry(
            0,
            _user,
            _role == Role.Secretary ? AuditTrail.ActionType.SecretaryAdded :
            _role == Role.Jury ? AuditTrail.ActionType.JuryAdded :
            AuditTrail.ActionType.DocumentCreated, // Placeholder for lawyer
            string(abi.encodePacked("Role assigned: ", _role == Role.Secretary ? "Secretary" :
                                   _role == Role.Jury ? "Jury" : "Lawyer")),
            ""
        );

        emit RoleAssigned(_user, _role);
    }

    function createDocument(
        string memory _title,
        string memory _description,
        string memory _ipfsHash
    ) external onlyRole(Role.Secretary) returns (uint256) {
        uint256 documentId = documentManager.createDocument(_title, _description, _ipfsHash);

        auditTrail.addAuditEntry(
            documentId,
            msg.sender,
            AuditTrail.ActionType.DocumentCreated,
            "Document created",
            string(abi.encodePacked("Title: ", _title))
        );

        // Auto-create vote session for new documents
        address[] memory juryMembers = getJuryMembers();
        uint256 voteSessionId = juryVoting.createVoteSession(documentId, juryMembers, 7 days);

        emit DocumentWorkflowStarted(documentId, voteSessionId);

        return documentId;
    }

    function voteOnDocument(
        uint256 _documentId,
        bool _approve,
        string memory _comment
    ) external onlyRole(Role.Jury) {
        // Vote through DocumentManager
        documentManager.voteOnDocument(_documentId, _approve, _comment);

        // Also record in JuryVoting if session exists
        // This is simplified - in practice, you'd link them properly

        auditTrail.addAuditEntry(
            _documentId,
            msg.sender,
            AuditTrail.ActionType.VoteCast,
            _approve ? "Approved document" : "Rejected document",
            _comment
        );
    }

    function resubmitDocument(
        uint256 _documentId,
        string memory _newIpfsHash
    ) external onlyRole(Role.Secretary) {
        documentManager.resubmitDocument(_documentId, _newIpfsHash);

        auditTrail.addAuditEntry(
            _documentId,
            msg.sender,
            AuditTrail.ActionType.DocumentResubmitted,
            "Document resubmitted with new version",
            string(abi.encodePacked("IPFS: ", _newIpfsHash))
        );
    }

    function getDocument(uint256 _documentId) external view returns (
        uint256 id,
        string memory title,
        string memory description,
        address secretary,
        uint256 version,
        string memory ipfsHash,
        DocumentManager.DocumentStatus status,
        uint256 voteCount,
        string memory rejectionReason
    ) {
        return documentManager.getDocument(_documentId);
    }

    function getAuditTrail(uint256 _documentId) external view returns (AuditTrail.AuditEntry[] memory) {
        return auditTrail.getDocumentAuditTrail(_documentId);
    }

    function getUserRole(address _user) external view returns (Role) {
        return userRoles[_user];
    }

    function getJuryMembers() public view returns (address[] memory) {
        // This is a simplified implementation
        // In practice, you'd query the jury members from DocumentManager or JuryVoting
        address[] memory jury = new address[](3);
        jury[0] = address(0x1111111111111111111111111111111111111111);
        jury[1] = address(0x2222222222222222222222222222222222222222);
        jury[2] = address(0x3333333333333333333333333333333333333333);
        return jury;
    }

    // Analytics functions
    function getDocumentStats() external view returns (
        uint256 totalDocuments,
        uint256 pendingDocuments,
        uint256 approvedDocuments,
        uint256 rejectedDocuments
    ) {
        totalDocuments = documentManager.documentCount();
        // In a real implementation, you'd iterate through all documents
        // For simplicity, return placeholder values
        pendingDocuments = 5;
        approvedDocuments = 10;
        rejectedDocuments = 2;
    }

    function getVotingStats() external view returns (
        uint256 totalVoteSessions,
        uint256 activeSessions,
        uint256 completedSessions
    ) {
        totalVoteSessions = juryVoting.sessionCount();
        // Simplified implementation
        activeSessions = 3;
        completedSessions = totalVoteSessions - activeSessions;
    }

    // Emergency functions
    function pauseContract() external onlyOwner {
        // Implementation for pausing would go here
    }

    function unpauseContract() external onlyOwner {
        // Implementation for unpausing would go here
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
}