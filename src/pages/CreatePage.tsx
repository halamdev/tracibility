import React from 'react';
import { ProductForm } from '../components';
import { toast } from 'react-toastify';
import { useContractContext } from '../contexts/ContractContext';

export const CreatePage: React.FC = () => {
  const {
    walletState,
    loading,
    error,
    createProduct,
    clearError,
  } = useContractContext();

  // Redirect if not authorized
  if (!walletState.isConnected) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Cần kết nối ví
          </h2>
          <p className="text-yellow-700">
            Vui lòng kết nối ví MetaMask để tạo sản phẩm mới
          </p>
        </div>
      </div>
    );
  }

  if (!walletState.isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Không có quyền truy cập
          </h2>
          <p className="text-red-700">
            Bạn cần được cấp quyền từ chủ hợp đồng để có thể tạo sản phẩm mới
          </p>
        </div>
      </div>
    );
  }

  const handleCreateProduct = async (productId: string, name: string, ipfsHash: string, location: string) => {
    const result = await createProduct(productId, name, ipfsHash, location);
    if (result) {
      toast.success('Sản phẩm đã được tạo thành công!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Tạo sản phẩm mới
        </h1>
        <p className="text-gray-600">
          Đăng ký sản phẩm mới vào hệ thống truy xuất nguồn gốc
        </p>
      </div>

      {error && toast.error(error, { onClose: clearError })}

      {/* Product Form */}
      <ProductForm
        onSubmit={handleCreateProduct}
        loading={loading}
        isAuthorized={walletState.isAuthorized}
      />
    </div>
  );
};