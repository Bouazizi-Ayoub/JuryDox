// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DocumentManager
 * @dev Contrat pour gérer les documents légaux avec versioning
 */
contract DocumentManager {
    struct Document {
        uint256 id;
        string title;
        string description;
        address secretary;
        uint256 version;
        string ipfsHash;
        bytes32 signature;
        bytes32 txHash;
        uint256 createdAt;
        uint256 updatedAt;
        DocumentStatus status;
        address[] juryMembers;
        mapping(address => Vote) votes;
        uint256 voteCount;
        string rejectionReason;
        uint256[] previousVersions;
    }

    enum DocumentStatus { Pending, Approved, Rejected, Resubmitted }

    struct Vote {
        bool hasVoted;
        bool approve;
        string comment;
        uint256 timestamp;
    }

    mapping(uint256 => Document) public documents;
    uint256 public documentCount;

    address public owner;
    mapping(address => bool) public secretaries;
    mapping(address => bool) public juryMembers;
    mapping(address => bool) public lawyers;

    event DocumentCreated(uint256 indexed documentId, address indexed secretary);
    event DocumentUpdated(uint256 indexed documentId, uint256 newVersion);
    event DocumentVoted(uint256 indexed documentId, address indexed jury, bool approve);
    event DocumentRejected(uint256 indexed documentId, string reason);

    modifier onlySecretary() {
        require(secretaries[msg.sender], "Only secretary can perform this action");
        _;
    }

    modifier onlyJury() {
        require(juryMembers[msg.sender], "Only jury can perform this action");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addSecretary(address _secretary) external onlyOwner {
        secretaries[_secretary] = true;
    }

    function addJuryMember(address _jury) external onlyOwner {
        juryMembers[_jury] = true;
    }

    function addLawyer(address _lawyer) external onlyOwner {
        lawyers[_lawyer] = true;
    }

    function createDocument(
        string memory _title,
        string memory _description,
        string memory _ipfsHash
    ) external onlySecretary returns (uint256) {
        documentCount++;
        Document storage doc = documents[documentCount];
        doc.id = documentCount;
        doc.title = _title;
        doc.description = _description;
        doc.secretary = msg.sender;
        doc.version = 1;
        doc.ipfsHash = _ipfsHash;
        doc.createdAt = block.timestamp;
        doc.updatedAt = block.timestamp;
        doc.status = DocumentStatus.Pending;

        emit DocumentCreated(documentCount, msg.sender);
        return documentCount;
    }

    function voteOnDocument(
        uint256 _documentId,
        bool _approve,
        string memory _comment
    ) external onlyJury {
        Document storage doc = documents[_documentId];
        require(doc.status == DocumentStatus.Pending, "Document not pending");

        require(!doc.votes[msg.sender].hasVoted, "Already voted");

        doc.votes[msg.sender] = Vote(true, _approve, _comment, block.timestamp);
        doc.voteCount++;

        emit DocumentVoted(_documentId, msg.sender, _approve);

        // Simple consensus: majority wins
        uint256 totalJury = getJuryCount();
        if (doc.voteCount >= (totalJury + 1) / 2) {
            uint256 approveCount = 0;
            for (uint256 i = 0; i < doc.juryMembers.length; i++) {
                if (doc.votes[doc.juryMembers[i]].approve) {
                    approveCount++;
                }
            }
            if (approveCount > totalJury / 2) {
                doc.status = DocumentStatus.Approved;
            } else {
                doc.status = DocumentStatus.Rejected;
                doc.rejectionReason = _comment;
                emit DocumentRejected(_documentId, _comment);
            }
        }
    }

    function resubmitDocument(
        uint256 _documentId,
        string memory _newIpfsHash
    ) external onlySecretary {
        Document storage doc = documents[_documentId];
        require(doc.secretary == msg.sender, "Not the document secretary");
        require(doc.status == DocumentStatus.Rejected, "Document not rejected");

        doc.previousVersions.push(doc.version);
        doc.version++;
        doc.ipfsHash = _newIpfsHash;
        doc.status = DocumentStatus.Pending;
        doc.updatedAt = block.timestamp;
        doc.voteCount = 0; // Reset votes

        emit DocumentUpdated(_documentId, doc.version);
    }

    function getDocument(uint256 _documentId) external view returns (
        uint256 id,
        string memory title,
        string memory description,
        address secretary,
        uint256 version,
        string memory ipfsHash,
        DocumentStatus status,
        uint256 voteCount,
        string memory rejectionReason
    ) {
        Document storage doc = documents[_documentId];
        return (
            doc.id,
            doc.title,
            doc.description,
            doc.secretary,
            doc.version,
            doc.ipfsHash,
            doc.status,
            doc.voteCount,
            doc.rejectionReason
        );
    }

    function getJuryCount() internal view returns (uint256) {
        uint256 count = 0;
        // In a real implementation, you'd iterate through juryMembers mapping
        // For simplicity, return a fixed number or implement proper counting
        return 3; // Example: assume 3 jury members
    }

    function getVote(uint256 _documentId, address _jury) external view returns (
        bool hasVoted,
        bool approve,
        string memory comment,
        uint256 timestamp
    ) {
        Vote memory vote = documents[_documentId].votes[_jury];
        return (vote.hasVoted, vote.approve, vote.comment, vote.timestamp);
    }
}