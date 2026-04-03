// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AuditTrail
 * @dev Contrat pour enregistrer et consulter l'historique des actions
 */
contract AuditTrail {
    struct AuditEntry {
        uint256 id;
        uint256 documentId;
        address actor;
        ActionType action;
        string description;
        uint256 timestamp;
        bytes32 txHash;
        string metadata;
    }

    enum ActionType {
        DocumentCreated,
        DocumentUpdated,
        VoteCast,
        DocumentApproved,
        DocumentRejected,
        DocumentResubmitted,
        JuryAdded,
        JuryRemoved,
        SecretaryAdded,
        SecretaryRemoved
    }

    mapping(uint256 => AuditEntry[]) public documentAuditTrail;
    mapping(address => AuditEntry[]) public userAuditTrail;
    uint256 public totalEntries;

    address public owner;
    mapping(address => bool) public authorizedContracts;

    event AuditEntryAdded(
        uint256 indexed documentId,
        address indexed actor,
        ActionType action,
        uint256 entryId
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner || authorizedContracts[msg.sender],
            "Not authorized to add audit entries"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function authorizeContract(address _contract) external onlyOwner {
        authorizedContracts[_contract] = true;
    }

    function revokeContract(address _contract) external onlyOwner {
        authorizedContracts[_contract] = false;
    }

    function addAuditEntry(
        uint256 _documentId,
        address _actor,
        ActionType _action,
        string memory _description,
        string memory _metadata
    ) external onlyAuthorized returns (uint256) {
        totalEntries++;

        AuditEntry memory entry = AuditEntry({
            id: totalEntries,
            documentId: _documentId,
            actor: _actor,
            action: _action,
            description: _description,
            timestamp: block.timestamp,
            txHash: keccak256(abi.encodePacked(block.timestamp, _actor, _action)),
            metadata: _metadata
        });

        documentAuditTrail[_documentId].push(entry);
        userAuditTrail[_actor].push(entry);

        emit AuditEntryAdded(_documentId, _actor, _action, totalEntries);
        return totalEntries;
    }

    function getDocumentAuditTrail(uint256 _documentId)
        external
        view
        returns (AuditEntry[] memory)
    {
        return documentAuditTrail[_documentId];
    }

    function getUserAuditTrail(address _user)
        external
        view
        returns (AuditEntry[] memory)
    {
        return userAuditTrail[_user];
    }

    function getAuditEntry(uint256 _documentId, uint256 _index)
        external
        view
        returns (
            uint256 id,
            address actor,
            ActionType action,
            string memory description,
            uint256 timestamp,
            bytes32 txHash,
            string memory metadata
        )
    {
        AuditEntry memory entry = documentAuditTrail[_documentId][_index];
        return (
            entry.id,
            entry.actor,
            entry.action,
            entry.description,
            entry.timestamp,
            entry.txHash,
            entry.metadata
        );
    }

    function getDocumentAuditTrailLength(uint256 _documentId)
        external
        view
        returns (uint256)
    {
        return documentAuditTrail[_documentId].length;
    }

    function getUserAuditTrailLength(address _user)
        external
        view
        returns (uint256)
    {
        return userAuditTrail[_user].length;
    }

    function searchAuditTrail(
        uint256 _documentId,
        ActionType _action,
        address _actor
    ) external view returns (AuditEntry[] memory) {
        AuditEntry[] memory trail = documentAuditTrail[_documentId];
        uint256 count = 0;

        // First pass: count matching entries
        for (uint256 i = 0; i < trail.length; i++) {
            if ((_action == ActionType.DocumentCreated || trail[i].action == _action) &&
                (_actor == address(0) || trail[i].actor == _actor)) {
                count++;
            }
        }

        // Second pass: collect matching entries
        AuditEntry[] memory results = new AuditEntry[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < trail.length; i++) {
            if ((_action == ActionType.DocumentCreated || trail[i].action == _action) &&
                (_actor == address(0) || trail[i].actor == _actor)) {
                results[index] = trail[i];
                index++;
            }
        }

        return results;
    }

    function getRecentEntries(uint256 _limit)
        external
        view
        returns (AuditEntry[] memory)
    {
        require(_limit > 0 && _limit <= 100, "Limit must be between 1 and 100");

        // This is a simplified implementation
        // In practice, you'd need a more efficient way to track recent entries
        AuditEntry[] memory recent = new AuditEntry[](_limit);

        // For demonstration, return last N entries from a sample document
        // In real implementation, maintain a global audit log
        uint256 sampleDocId = 1;
        AuditEntry[] memory trail = documentAuditTrail[sampleDocId];

        uint256 startIndex = trail.length > _limit ? trail.length - _limit : 0;
        uint256 count = 0;

        for (uint256 i = startIndex; i < trail.length && count < _limit; i++) {
            recent[count] = trail[i];
            count++;
        }

        return recent;
    }
}