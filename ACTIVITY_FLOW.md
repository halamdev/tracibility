# Sơ đồ Activity Flow - Hệ thống Truy xuất Nguồn gốc Sản phẩm

## Tổng quan hệ thống

Hệ thống truy xuất nguồn gốc sản phẩm sử dụng công nghệ blockchain Ethereum để đảm bảo tính minh bạch, bất biến và an toàn trong chuỗi cung ứng. Hệ thống bao gồm:

- **Smart Contract**: Lưu trữ thông tin sản phẩm và lịch sử truy xuất trên blockchain
- **IPFS**: Lưu trữ metadata, hình ảnh và chứng chỉ sản phẩm
- **Web Application**: Giao diện người dùng để tương tác với hệ thống

---

## 1. LUỒNG KHỞI TẠO HỆ THỐNG

```
[Bắt đầu] → [Deploy Smart Contract] → [Owner được thiết lập] → [Hệ thống sẵn sàng]
```

### Chi tiết:
1. **Deploy Smart Contract**
   - Contract được deploy lên Ethereum network
   - Địa chỉ deploy trở thành Owner
   - Khởi tạo các mapping và state variables

2. **Thiết lập quyền**
   - Owner có toàn quyền quản lý
   - Có thể cấp/thu hồi quyền cho các nhà cung cấp

---

## 2. LUỒNG QUẢN LÝ QUYỀN TRUY CẬP

```
[Owner kết nối ví] → [Truy cập Admin Panel] → [Nhập địa chỉ ví] → [Chọn hành động]
                                                                        ↓
[Cấp quyền] ← [Authorize Transaction] ← [Xác nhận trên MetaMask] ← [Authorize]
     ↓                                                                ↑
[Event: Authorized] → [Cập nhật trạng thái] → [Thông báo thành công] ←┘

[Thu hồi quyền] ← [Revoke Transaction] ← [Xác nhận trên MetaMask] ← [Revoke]
     ↓                                                               ↑
[Event: Revoked] → [Cập nhật trạng thái] → [Thông báo thành công] ←┘
```

### Chi tiết:
1. **Cấp quyền (Authorize)**
   - Owner nhập địa chỉ ví cần cấp quyền
   - Gọi function `authorize(address)`
   - Transaction được ghi nhận trên blockchain
   - Event `Authorized` được emit

2. **Thu hồi quyền (Revoke)**
   - Owner nhập địa chỉ ví cần thu hồi
   - Gọi function `revoke(address)`
   - Transaction được ghi nhận trên blockchain
   - Event `Revoked` được emit

---

## 3. LUỒNG TẠO SẢN PHẨM MỚI

```
[Nhà cung cấp kết nối ví] → [Kiểm tra quyền] → [Có quyền?]
                                                    ↓ Có
[Điền form tạo sản phẩm] ← [Truy cập trang Products] ←┘
         ↓
[Upload hình ảnh lên IPFS] → [Nhận Image Hash]
         ↓
[Upload chứng chỉ lên IPFS] → [Nhận Certificate Hash]
         ↓
[Tạo metadata JSON] → [Upload metadata lên IPFS] → [Nhận Metadata Hash]
         ↓
[Gọi createProduct()] → [Xác nhận MetaMask] → [Transaction thành công?]
         ↓ Có                                           ↓ Không
[Event: ProductCreated] → [Tạo QR Code] → [Thông báo thành công] → [Lỗi]
         ↓
[Cập nhật danh sách sản phẩm] → [Kết thúc]
```

### Chi tiết:
1. **Chuẩn bị dữ liệu**
   - Nhập thông tin: tên, mô tả, địa điểm sản xuất
   - Upload hình ảnh sản phẩm lên Pinata IPFS
   - Upload chứng chỉ (PDF/Image) lên Pinata IPFS

2. **Tạo metadata**
   ```json
   {
     "productId": "SP-XXXXXXXXX",
     "name": "Tên sản phẩm",
     "description": "Mô tả chi tiết",
     "location": "Địa điểm sản xuất",
     "image": "ipfs://QmXXXXXX",
     "certificate": "ipfs://QmYYYYYY",
     "createdAt": "2024-01-01T00:00:00.000Z"
   }
   ```

3. **Ghi nhận trên blockchain**
   - Gọi `createProduct(productId, name, ipfsHash, location, status)`
   - Status mặc định: `ProductStatus.Created`
   - Event `ProductCreated` được emit

4. **Tạo QR Code**
   - Generate QR code chứa URL tra cứu
   - Cho phép download QR code

---

## 4. LUỒNG TRA CỨU SẢN PHẨM

```
[Người dùng truy cập] → [Nhập mã sản phẩm] → [Gọi getProduct()]
                                                    ↓
[Sản phẩm tồn tại?] → [Không] → [Hiển thị lỗi "Không tìm thấy"]
         ↓ Có
[Lấy thông tin từ contract] → [Lấy metadata từ IPFS]
         ↓                           ↓
[Lấy danh sách steps] → [Hiển thị thông tin chi tiết]
         ↓
[Hiển thị timeline truy xuất] → [Tạo QR Code] → [Kết thúc]
```

### Chi tiết:
1. **Lấy thông tin cơ bản**
   - Gọi `getProduct(productId)` từ smart contract
   - Nhận: name, ipfsHash, creator, status, steps, location

2. **Lấy metadata từ IPFS**
   - Fetch từ `https://gateway.pinata.cloud/ipfs/{hash}`
   - Parse JSON để lấy mô tả, hình ảnh, chứng chỉ

3. **Hiển thị thông tin**
   - Thông tin cơ bản: mã, tên, nhà sản xuất, địa điểm
   - Hình ảnh sản phẩm từ IPFS
   - Chứng chỉ (PDF viewer hoặc image)
   - Timeline các bước truy xuất
   - QR Code để chia sẻ

---

## 5. LUỒNG THÊM BƯỚC TRUY XUẤT

```
[Nhà cung cấp có quyền] → [Tìm sản phẩm] → [Sản phẩm tồn tại?]
                                                ↓ Có
[Điền form thêm bước] ← [Hiển thị form AddStep] ←┘
         ↓
[Nhập: địa điểm, mô tả, trạng thái] → [Gọi addStep()]
         ↓
[Xác nhận MetaMask] → [Transaction thành công?]
         ↓ Có                    ↓ Không
[Event: StepAdded] → [Cập nhật timeline] → [Thông báo thành công] → [Lỗi]
         ↓
[Refresh danh sách steps] → [Kết thúc]
```

### Chi tiết:
1. **Kiểm tra quyền**
   - Chỉ địa chỉ được authorize mới thêm được step
   - Kiểm tra sản phẩm tồn tại

2. **Thông tin bước truy xuất**
   - Địa điểm thực hiện
   - Mô tả hành động
   - Trạng thái (Manufactured, Inspected, Packaged, etc.)
   - Timestamp tự động (block.timestamp)
   - Actor (địa chỉ người thực hiện)

3. **Ghi nhận**
   - Gọi `addStep(productId, location, description, stepStatus)`
   - Event `StepAdded` được emit
   - Cập nhật timeline hiển thị

---

## 6. LUỒNG QUẢN LÝ DANH SÁCH SẢN PHẨM

```
[Truy cập trang Products] → [Kết nối ví?]
                                ↓ Có
[Lấy địa chỉ creator] → [Gọi getProductsByCreator()]
         ↓
[Nhận danh sách productIds] → [Lặp qua từng ID]
         ↓
[Gọi getProduct() cho mỗi ID] → [Lấy metadata từ IPFS]
         ↓
[Hiển thị danh sách] → [Tìm kiếm/Lọc] → [Hiển thị kết quả]
         ↓
[Click vào sản phẩm] → [Chuyển đến trang tra cứu] → [Kết thúc]
```

### Chi tiết:
1. **Lấy danh sách**
   - Gọi `getProductsByCreator(address)` 
   - Nhận mảng các productId

2. **Lấy chi tiết từng sản phẩm**
   - Gọi `getProduct()` cho mỗi ID
   - Fetch metadata từ IPFS
   - Tổng hợp thông tin hiển thị

3. **Tính năng**
   - Tìm kiếm theo tên/mã sản phẩm
   - Lọc theo trạng thái step
   - Tạo/download QR code
   - Xem chi tiết sản phẩm

---

## 7. LUỒNG XỬ LÝ LỖI VÀ EXCEPTION

```
[Lỗi xảy ra] → [Phân loại lỗi]
                    ↓
[Lỗi kết nối ví] → [Hiển thị "Cần kết nối MetaMask"]
                    ↓
[Lỗi quyền truy cập] → [Hiển thị "Không có quyền"]
                    ↓
[Lỗi network] → [Hiển thị "Kiểm tra network"]
                    ↓
[Lỗi contract] → [Hiển thị thông báo lỗi cụ thể]
                    ↓
[Lỗi IPFS] → [Hiển thị "Không thể tải metadata"]
                    ↓
[Log lỗi] → [Hiển thị toast notification] → [Kết thúc]
```

### Các loại lỗi chính:
1. **Lỗi kết nối**
   - MetaMask chưa cài đặt
   - Ví chưa kết nối
   - Sai network

2. **Lỗi quyền**
   - Không có quyền tạo sản phẩm
   - Không phải owner
   - Địa chỉ chưa được authorize

3. **Lỗi dữ liệu**
   - Sản phẩm không tồn tại
   - IPFS không thể truy cập
   - Metadata không hợp lệ

4. **Lỗi transaction**
   - Không đủ gas
   - User reject transaction
   - Contract revert

---

## 8. LUỒNG TÍCH HỢP IPFS

```
[Cần lưu file] → [Chuẩn bị FormData] → [Gọi Pinata API]
                                            ↓
[Upload thành công?] → [Không] → [Retry/Báo lỗi]
         ↓ Có
[Nhận IPFS Hash] → [Lưu hash vào metadata] → [Sử dụng hash]
                                                  ↓
[Hiển thị file] ← [Gateway URL] ← [Tạo URL từ hash]
```

### Chi tiết:
1. **Upload file**
   - Sử dụng Pinata API
   - Headers: Authorization Bearer token
   - FormData chứa file

2. **Nhận hash**
   - Response chứa IpfsHash
   - Lưu dưới dạng `ipfs://{hash}`

3. **Truy cập file**
   - Gateway: `https://gateway.pinata.cloud/ipfs/{hash}`
   - Hiển thị image/PDF trong UI

---

## 9. LUỒNG TẠO VÀ QUẢN LÝ QR CODE

```
[Cần tạo QR Code] → [Tạo URL tra cứu] → [Generate QR Code]
                                            ↓
[QR Code DataURL] → [Hiển thị trong UI] → [Download QR Code]
                                            ↓
[Tạo link download] → [User click] → [File được tải] → [Kết thúc]
```

### Chi tiết:
1. **Tạo URL**
   - Format: `${window.location.origin}/search?id=${productId}`

2. **Generate QR**
   - Sử dụng thư viện `qrcode`
   - Kích thước: 256x256px
   - Format: DataURL

3. **Download**
   - Tạo element `<a>` với href = dataURL
   - Filename: `qr-${productId}.png`

---

## 10. SƠ ĐỒ TỔNG QUAN LUỒNG CHÍNH

```
                    [HỆ THỐNG TRUY XUẤT NGUỒN GỐC]
                                    |
                    [Owner Deploy Smart Contract]
                                    |
                         [Cấp quyền cho Suppliers]
                                    |
            ┌─────────────────────┼─────────────────────┐
            |                     |                     |
    [Supplier tạo sản phẩm]  [Supplier thêm steps]  [User tra cứu]
            |                     |                     |
    [Upload lên IPFS]       [Ghi nhận trên chain]  [Xem thông tin]
            |                     |                     |
    [Ghi nhận trên chain]   [Cập nhật timeline]    [Xem timeline]
            |                     |                     |
    [Tạo QR Code]           [Thông báo thành công]  [Download QR]
            |                     |                     |
            └─────────────────────┼─────────────────────┘
                                  |
                        [Hệ thống hoàn chỉnh]
```

---

## 11. CÁC TRẠNG THÁI VÀ CHUYỂN ĐỔI

### Trạng thái sản phẩm (ProductStatus):
```
Created → InProgress → Completed
   ↓           ↓           ↓
   └─────→ Rejected ←─────┘
```

### Trạng thái bước truy xuất (StepStatus):
```
Manufactured → Inspected → Packaged → Stored → Shipped → Received → Sold
                                                                      ↓
                                                                  Returned
                                                                      ↓
                                                                  Disposed
```

---

## 12. KIẾN TRÚC TỔNG QUAN

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Blockchain    │    │      IPFS       │
│   (React App)   │    │   (Ethereum)    │    │   (Pinata)      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • UI Components │◄──►│ • Smart Contract│    │ • Images        │
│ • State Mgmt    │    │ • Events        │    │ • Certificates  │
│ • API Calls     │    │ • Transactions  │    │ • Metadata      │
│ • Error Handle  │    │ • Gas Fees      │    │ • JSON Files    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   MetaMask      │
                    │   (Web3 Wallet) │
                    └─────────────────┘
```

Sơ đồ này mô tả toàn bộ luồng hoạt động của hệ thống truy xuất nguồn gốc sản phẩm, từ khởi tạo đến vận hành, bao gồm tất cả các tương tác giữa người dùng, smart contract, và các dịch vụ bên ngoài.