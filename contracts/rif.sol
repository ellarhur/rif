// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Rif {

    struct Project {
        uint256 id;
        address owner;
        string title;
        string description;
        uint256 createdAt;
        bool exists;
    }

    struct Soundbite {
        uint256 id;
        uint256 projectId;
        address author;
        string ipfsCid;      
        string SoundbiteType;
        string description;
        uint256 timestamp;
    }

    uint256 private _projectCounter;
    uint256 private _SoundbiteCounter;

    mapping(uint256 => Project) public projects;
    mapping(uint256 => Soundbite) public Soundbites;
    mapping(address => uint256[]) public ownerProjects;
    mapping(uint256 => uint256[]) public projectSoundbites;

    event ProjectCreated(uint256 indexed projectId, address indexed owner, string title);
    event SoundbiteAdded(uint256 indexed SoundbiteId, uint256 indexed projectId, address indexed author, string ipfsCid);

    modifier projectExists(uint256 projectId) {
        require(projects[projectId].exists, "Project does not exist");
        _;
    }

    modifier onlyProjectOwner(uint256 projectId) {
        require(projects[projectId].owner == msg.sender, "Not project owner");
        _;
    }

    function createProject(string calldata title, string calldata description)
        external
        returns (uint256)
    {
        require(bytes(title).length > 0, "Title required");
        _projectCounter++;
        uint256 projectId = _projectCounter;

        projects[projectId] = Project({
            id: projectId,
            owner: msg.sender,
            title: title,
            description: description,
            createdAt: block.timestamp,
            exists: true
        });

        ownerProjects[msg.sender].push(projectId);
        emit ProjectCreated(projectId, msg.sender, title);
        return projectId;
    }

    function addSoundbite(
        uint256 projectId,
        string calldata ipfsCid,
        string calldata SoundbiteType,
        string calldata description
    )
        external
        projectExists(projectId)
        onlyProjectOwner(projectId)
        returns (uint256)
    {
        require(bytes(ipfsCid).length > 0, "CID required");

        _SoundbiteCounter++;
        uint256 SoundbiteId = _SoundbiteCounter;

        Soundbites[SoundbiteId] = Soundbite({
            id: SoundbiteId,
            projectId: projectId,
            author: msg.sender,
            ipfsCid: ipfsCid,
            SoundbiteType: SoundbiteType,
            description: description,
            timestamp: block.timestamp
        });

        projectSoundbites[projectId].push(SoundbiteId);
        emit SoundbiteAdded(SoundbiteId, projectId, msg.sender, ipfsCid);
        return SoundbiteId;
    }


    function getProjectSoundbites(uint256 projectId)
        external
        view
        projectExists(projectId)
        returns (uint256[] memory)
    {
        return projectSoundbites[projectId];
    }

    function getOwnerProjects(address owner)
        external
        view
        returns (uint256[] memory)
    {
        return ownerProjects[owner];
    }

    function projectCount() external view returns (uint256) {
        return _projectCounter;
    }

    function SoundbiteCount() external view returns (uint256) {
        return _SoundbiteCounter;
    }
}
