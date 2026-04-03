// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title JuryVoting
 * @dev Contrat spécialisé pour le système de vote multi-jury
 */
contract JuryVoting {
    struct VoteSession {
        uint256 documentId;
        address[] juryMembers;
        mapping(address => Vote) votes;
        uint256 voteCount;
        uint256 requiredVotes;
        bool isActive;
        uint256 deadline;
        VoteResult result;
    }

    enum VoteResult { Pending, Approved, Rejected, Consensus }

    struct Vote {
        bool hasVoted;
        bool approve;
        string comment;
        uint256 timestamp;
    }

    mapping(uint256 => VoteSession) public voteSessions;
    uint256 public sessionCount;

    address public owner;
    mapping(address => bool) public juryMembers;

    event VoteSessionCreated(uint256 indexed sessionId, uint256 indexed documentId);
    event VoteCast(uint256 indexed sessionId, address indexed jury, bool approve);
    event VoteSessionClosed(uint256 indexed sessionId, VoteResult result);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyJury() {
        require(juryMembers[msg.sender], "Only jury can perform this action");
        _;
    }

    modifier sessionActive(uint256 _sessionId) {
        require(voteSessions[_sessionId].isActive, "Vote session not active");
        require(block.timestamp <= voteSessions[_sessionId].deadline, "Vote session expired");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addJuryMember(address _jury) external onlyOwner {
        juryMembers[_jury] = true;
    }

    function removeJuryMember(address _jury) external onlyOwner {
        juryMembers[_jury] = false;
    }

    function createVoteSession(
        uint256 _documentId,
        address[] memory _juryMembers,
        uint256 _duration
    ) external onlyOwner returns (uint256) {
        sessionCount++;
        VoteSession storage session = voteSessions[sessionCount];
        session.documentId = _documentId;
        session.juryMembers = _juryMembers;
        session.requiredVotes = (_juryMembers.length + 1) / 2; // Majority
        session.isActive = true;
        session.deadline = block.timestamp + _duration;
        session.result = VoteResult.Pending;

        emit VoteSessionCreated(sessionCount, _documentId);
        return sessionCount;
    }

    function castVote(
        uint256 _sessionId,
        bool _approve,
        string memory _comment
    ) external onlyJury sessionActive(_sessionId) {
        VoteSession storage session = voteSessions[_sessionId];

        // Check if jury member is assigned to this session
        bool isAssigned = false;
        for (uint256 i = 0; i < session.juryMembers.length; i++) {
            if (session.juryMembers[i] == msg.sender) {
                isAssigned = true;
                break;
            }
        }
        require(isAssigned, "Not assigned to this vote session");

        require(!session.votes[msg.sender].hasVoted, "Already voted");

        session.votes[msg.sender] = Vote(true, _approve, _comment, block.timestamp);
        session.voteCount++;

        emit VoteCast(_sessionId, msg.sender, _approve);

        // Check for consensus
        _checkConsensus(_sessionId);
    }

    function _checkConsensus(uint256 _sessionId) internal {
        VoteSession storage session = voteSessions[_sessionId];

        if (session.voteCount < session.requiredVotes) {
            return;
        }

        uint256 approveCount = 0;
        uint256 rejectCount = 0;

        for (uint256 i = 0; i < session.juryMembers.length; i++) {
            address jury = session.juryMembers[i];
            if (session.votes[jury].hasVoted) {
                if (session.votes[jury].approve) {
                    approveCount++;
                } else {
                    rejectCount++;
                }
            }
        }

        if (approveCount >= session.requiredVotes) {
            session.result = VoteResult.Approved;
            session.isActive = false;
            emit VoteSessionClosed(_sessionId, VoteResult.Approved);
        } else if (rejectCount >= session.requiredVotes) {
            session.result = VoteResult.Rejected;
            session.isActive = false;
            emit VoteSessionClosed(_sessionId, VoteResult.Rejected);
        } else if (session.voteCount == session.juryMembers.length) {
            // All votes cast, check final result
            if (approveCount > rejectCount) {
                session.result = VoteResult.Approved;
            } else {
                session.result = VoteResult.Rejected;
            }
            session.isActive = false;
            emit VoteSessionClosed(_sessionId, session.result);
        }
    }

    function getVoteSession(uint256 _sessionId) external view returns (
        uint256 documentId,
        uint256 voteCount,
        uint256 requiredVotes,
        bool isActive,
        uint256 deadline,
        VoteResult result
    ) {
        VoteSession storage session = voteSessions[_sessionId];
        return (
            session.documentId,
            session.voteCount,
            session.requiredVotes,
            session.isActive,
            session.deadline,
            session.result
        );
    }

    function getVote(uint256 _sessionId, address _jury) external view returns (
        bool hasVoted,
        bool approve,
        string memory comment,
        uint256 timestamp
    ) {
        Vote memory vote = voteSessions[_sessionId].votes[_jury];
        return (vote.hasVoted, vote.approve, vote.comment, vote.timestamp);
    }

    function getJuryMembers(uint256 _sessionId) external view returns (address[] memory) {
        return voteSessions[_sessionId].juryMembers;
    }

    function closeVoteSession(uint256 _sessionId) external onlyOwner {
        VoteSession storage session = voteSessions[_sessionId];
        require(session.isActive, "Session already closed");

        session.isActive = false;
        emit VoteSessionClosed(_sessionId, session.result);
    }
}