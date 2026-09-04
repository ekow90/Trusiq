// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ReviewAnchor is Ownable {
    struct Anchor {
        string reviewId;
        bytes32 reviewHash;
        string businessId;
        uint256 anchoredAt;
        address submitter;
    }

    mapping(string reviewId => Anchor anchor) private anchors;

    error EmptyValue();
    error ReviewAlreadyAnchored(string reviewId);

    event ReviewHashAnchored(
        string indexed reviewId,
        bytes32 indexed reviewHash,
        string businessId,
        uint256 anchoredAt,
        address indexed submitter
    );

    constructor() Ownable(msg.sender) {}

    function anchorReviewHash(
        string calldata reviewId,
        bytes32 reviewHash,
        string calldata businessId
    ) external onlyOwner {
        if (bytes(reviewId).length == 0 || bytes(businessId).length == 0 || reviewHash == bytes32(0)) {
            revert EmptyValue();
        }
        if (anchors[reviewId].anchoredAt != 0) {
            revert ReviewAlreadyAnchored(reviewId);
        }

        uint256 timestamp = block.timestamp;
        anchors[reviewId] = Anchor({
            reviewId: reviewId,
            reviewHash: reviewHash,
            businessId: businessId,
            anchoredAt: timestamp,
            submitter: msg.sender
        });

        emit ReviewHashAnchored(reviewId, reviewHash, businessId, timestamp, msg.sender);
    }

    function getAnchor(string calldata reviewId) external view returns (Anchor memory) {
        return anchors[reviewId];
    }

    function isAnchored(string calldata reviewId) external view returns (bool) {
        return anchors[reviewId].anchoredAt != 0;
    }
}
