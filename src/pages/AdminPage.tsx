import React from 'react';
import { AdminPanel } from '../components';
import { toast } from 'react-toastify';
import { useContractContext } from '../contexts/ContractContext';

export const AdminPage: React.FC = () => {
  const {
    walletState,
    loading,
    error,
    authorizeUser,
    revokeUser,
    clearError,
  } = useContractContext();

  // Redirect if not owner
  if (!walletState.isConnected) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Cần kết nối ví
          </h2>
          <p className="text-yellow-700">
            Vui lòng kết nối ví MetaMask để truy cập trang quản lý
          </p>
        </div>
      </div>
    );
  }

  if (!walletState.isOwner) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Không có quyền truy cập
          </h2>
          <p className="text-red-700">
            Chỉ chủ hợp đồng mới có thể truy cập trang quản lý quyền
          </p>
        </div>
      </div>
    );
  }

  const handleAuthorize = async (address: string) => {
    const result = await authorizeUser(address);
    if (result) {
      toast.success('Đã cấp quyền thành công!');
    }
  };

  const handleRevoke = async (address: string) => {
    const result = await revokeUser(address);
    if (result) {
      toast.success('Đã thu hồi quyền thành công!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Quản lý hệ thống
        </h1>
        <p className="text-gray-600">
          Cấp phát và thu hồi quyền truy cập cho các nhà cung cấp
        </p>
      </div>

      {error && toast.error(error, { onClose: clearError })}

      {/* Admin Panel */}
      <AdminPanel
        onAuthorize={handleAuthorize}
        onRevoke={handleRevoke}
        loading={loading}
        isOwner={walletState.isOwner}
      />

      {/* Info */}
      <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-800 mb-3">
          ℹ️ Thông tin quản lý
        </h3>
        <ul className="space-y-2 text-purple-700 text-sm">
          <li>• Chỉ các địa chỉ được cấp quyền mới có thể tạo sản phẩm và thêm bước truy xuất</li>
          <li>• Việc cấp/thu hồi quyền sẽ được ghi nhận trên blockchain</li>
          <li>• Bạn có thể kiểm tra trạng thái quyền của bất kỳ địa chỉ nào</li>
          <li>• Tất cả thay đổi quyền đều có thể được theo dõi qua events</li>
        </ul>
      </div>
    </div>
  );
};