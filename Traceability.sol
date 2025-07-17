// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title Hợp đồng truy xuất nguồn gốc sản phẩm (có kiểm soát truy cập & an toàn reentrancy)
contract Traceability is ReentrancyGuard {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // -------------------- MODIFIER BẢO VỆ --------------------
    modifier onlyOwner() {
        require(msg.sender == owner, "Khong phai chu hop dong");
        _;
    }

    modifier onlyAuthorized() {
        require(authorized[msg.sender], "Khong co quyen thuc hien");
        _;
    }

    // -------------------- KHAI BÁO CẤU TRÚC --------------------
    struct Step {
        string location;       // Địa điểm thực hiện
        string description;    // Mô tả hành động
        uint256 timestamp;     // Thời gian thực hiện
        address actor;         // Địa chỉ ví người thực hiện
    }

    struct Product {
        string productId;      // Mã sản phẩm duy nhất
        string name;           // Tên sản phẩm
        string ipfsHash;       // Hash IPFS chứa metadata mô tả (ảnh, chứng nhận…)
        address creator;       // Địa chỉ nhà sản xuất
        Step[] steps;          // Các bước truy xuất
        bool exists;           // Đã khởi tạo hay chưa
    }

    mapping(string => Product) private products;         // Lưu thông tin từng sản phẩm
    mapping(address => bool) private authorized;         // Danh sách ví được cấp quyền

    // -------------------- SỰ KIỆN --------------------
    event ProductCreated(string productId, string name, address indexed creator);
    event StepAdded(string productId, string location, string description, address indexed actor);
    event Authorized(address indexed user);
    event Revoked(address indexed user);

    // -------------------- QUẢN LÝ QUYỀN --------------------
    function authorize(address user) external onlyOwner {
        require(user != address(0), "Dia chi khong hop le");
        authorized[user] = true;
        emit Authorized(user);
    }

    function revoke(address user) external onlyOwner {
        require(authorized[user], "Dia chi chua duoc cap quyen");
        authorized[user] = false;
        emit Revoked(user);
    }

    function isAuthorized(address user) external view returns (bool) {
        return authorized[user];
    }

    // -------------------- TẠO SẢN PHẨM MỚI --------------------
    function createProduct(
        string memory productId,
        string memory name,
        string memory ipfsHash
    ) external onlyAuthorized nonReentrant {
        require(bytes(productId).length > 0, "Ma san pham rong");
        require(bytes(name).length > 0, "Ten san pham rong");
        require(bytes(ipfsHash).length > 10, "IPFS hash khong hop le");
        require(!products[productId].exists, "San pham da ton tai");

        Product storage p = products[productId];
        p.productId = productId;
        p.name = name;
        p.ipfsHash = ipfsHash;
        p.creator = msg.sender;
        p.exists = true;

        emit ProductCreated(productId, name, msg.sender);
    }

    // -------------------- THÊM BƯỚC TRUY XUẤT --------------------
    function addStep(
        string memory productId,
        string memory location,
        string memory description
    ) external onlyAuthorized nonReentrant {
        require(bytes(location).length > 0, "Dia diem rong");
        require(bytes(description).length > 0, "Mo ta rong");

        Step memory s = Step({
            location: location,
            description: description,
            timestamp: block.timestamp,
            actor: msg.sender
        });

        products[productId].steps.push(s);

        emit StepAdded(productId, location, description, msg.sender);
    }

    // -------------------- TRUY VẤN THÔNG TIN --------------------

    /// @notice Lấy danh sách các bước đã thực hiện
    function getSteps(string memory productId) external view returns (Step[] memory) {
        return products[productId].steps;
    }

    /// @notice Lấy thông tin chung về sản phẩm
    function getProduct(string memory productId)
        external
        view
        returns (string memory name, string memory ipfsHash, address creator, uint stepCount)
    {
        Product storage p = products[productId];
        return (p.name, p.ipfsHash, p.creator, p.steps.length);
    }

    /// @notice Kiểm tra sản phẩm đã tồn tại chưa
    function isProductExists(string memory productId) external view returns (bool) {
        return products[productId].exists;
    }
}