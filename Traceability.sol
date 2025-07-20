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

    enum ProductStatus { Created, InProgress, Completed, Rejected }
    enum StepStatus {  Manufactured,Inspected,Packaged,Stored,Shipped,Received,Sold,Returned,Disposed }

    struct Step {
        string location; // Địa điểm thực hiện
        string description;// Mô tả hành động
        uint256 timestamp;// Thời gian thực hiện
        address actor;// Địa chỉ ví người thực hiện
        StepStatus status;
    }

    struct Product {
        string productId;// Mã sản phẩm duy nhất
        string name;// Tên sản phẩm
        string ipfsHash;// Hash IPFS chứa metadata mô tả (ảnh, chứng nhận…)
        address creator;// Địa chỉ nhà sản xuất
        Step[] steps;// Các bước truy xuất
        bool exists;// Đã khởi tạo hay chưa
        ProductStatus status; // Trạng thái sản phẩm
        string location;
    }

    mapping(string => Product) private products;// Lưu thông tin từng sản phẩm
    mapping(address => bool) private authorized;// Danh sách ví được cấp quyền
    mapping(address => string[]) private creatorToProducts; // Lưu danh sách productId theo ví

    // -------------------- SỰ KIỆN --------------------
    event ProductCreated(string productId, string name, string location, address indexed creator,ProductStatus status);
    event StepAdded(string productId, string location, string description, address indexed actor,StepStatus status);
    event Authorized(address indexed user);
    event Revoked(address indexed user);
    event StatusUpdated(string productId, ProductStatus newStatus);

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
    string memory ipfsHash,
    string memory location,
    ProductStatus status // <- truyền status từ ngoài vào
) external onlyAuthorized nonReentrant {
    require(bytes(productId).length > 0, "Ma san pham rong");
    require(bytes(name).length > 0, "Ten san pham rong");
    require(bytes(ipfsHash).length > 10, "IPFS hash khong hop le");
    require(bytes(location).length > 0, "Location khong duoc de trong");
    require(!products[productId].exists, "San pham da ton tai");

    Product storage p = products[productId];
    p.productId = productId;
    p.name = name;
    p.ipfsHash = ipfsHash;
    p.creator = msg.sender;
    p.location = location;
    p.exists = true;
    p.status = status; 

    creatorToProducts[msg.sender].push(productId);

    emit ProductCreated(productId, name, location, msg.sender, status); // <- emit status
}


    // -------------------- THÊM BƯỚC TRUY XUẤT --------------------
    function addStep(
        string memory productId,
        string memory location,
        string memory description,
        StepStatus status
    ) external onlyAuthorized nonReentrant {
        require(products[productId].exists, "San pham khong ton tai");
        require(bytes(location).length > 0, "Dia diem rong");
        require(bytes(description).length > 0, "Mo ta rong");

        Step memory s = Step({
            location: location,
            description: description,
            timestamp: block.timestamp,
            actor: msg.sender,
            status: status
        });

        products[productId].steps.push(s);

        emit StepAdded(productId, location, description, msg.sender,status);
    }

    // -------------------- TRUY VẤN THÔNG TIN --------------------

    function getSteps(string memory productId) external view returns (Step[] memory) {
        require(products[productId].exists, "San pham khong ton tai");
        return products[productId].steps;
    }

    function getProduct(string memory productId)
    external
    view
    returns (
        string memory name,
        string memory ipfsHash,
        address creator,
        ProductStatus status,
        Step[] memory steps,
        string memory location
    )
    {
        require(products[productId].exists, "San pham khong ton tai");

        Product storage p = products[productId];
        return (
            p.name,
            p.ipfsHash,
            p.creator,
            p.status,
            p.steps,
            p.location
        );
    }

    function isProductExists(string memory productId) external view returns (bool) {
        return products[productId].exists;
    }

    /// @notice Lấy danh sách productId mà 1 creator đã tạo
    function getProductsByCreator(address creator) external view returns (string[] memory) {
        return creatorToProducts[creator];
    }

    /// @notice Cập nhật trạng thái sản phẩm
    function updateProductStatus(string memory productId, ProductStatus newStatus) external onlyAuthorized {
        require(products[productId].exists, "San pham khong ton tai");
        products[productId].status = newStatus;
        emit StatusUpdated(productId, newStatus);
    }

    /// @notice Lấy trạng thái sản phẩm
    function getProductStatus(string memory productId) external view returns (ProductStatus) {
        require(products[productId].exists, "San pham khong ton tai");
        return products[productId].status;
    }
}
