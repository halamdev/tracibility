import React, { useState } from 'react';
import { ProductSearch, ProductDetails, AddStepForm } from '../components';
import { toast } from 'react-toastify';
import { useContractContext } from '../contexts/ContractContext';
import { Product, Step } from '../types/contract';

export const SearchPage: React.FC = () => {
  const {
    walletState,
    loading,
    error,
    getProduct,
    getSteps,
    addStep,
    clearError,
  } = useContractContext();

  const [currentProduct, setCurrentProduct] = useState<{
    id: string;
    data: Product;
    steps: Step[];
  } | null>(null);
  // const [success, setSuccess] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = async (productId: string) => {
    try {
      setSearchLoading(true);
      const product = await getProduct(productId);
      
      if (!product) {
        setCurrentProduct(null);
        return;
      }

      const steps = await getSteps(productId);
      setCurrentProduct({
        id: productId,
        data: product,
        steps,
      });
    } catch (err) {
      setCurrentProduct(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddStep = async (productId: string, location: string, description: string, status:number) => {
    const result = await addStep(productId, location, description, status);
    if (result && currentProduct && currentProduct.id === productId) {
      // Refresh current product steps
      const updatedSteps = await getSteps(productId);
      setCurrentProduct(prev => prev ? { ...prev, steps: updatedSteps } : null);
      toast.success('Bước truy xuất đã được thêm thành công!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Tra cứu sản phẩm
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Nhập mã sản phẩm để xem thông tin chi tiết và lịch sử truy xuất nguồn gốc
        </p>
      </div>

      {error && toast.error(error, { onClose: clearError })}

      <div className="space-y-8">
        {/* Search Form */}
        <ProductSearch onSearch={handleSearch} loading={searchLoading} />

        {/* Product Details */}
        {currentProduct && (
          <div className="space-y-6">
            <ProductDetails
              productId={currentProduct.id}
              product={currentProduct.data}
              steps={currentProduct.steps}
            />
            
            {walletState.isAuthorized && (
              <AddStepForm
                productId={currentProduct.id}
                onSubmit={handleAddStep}
                loading={loading}
                isAuthorized={walletState.isAuthorized}
              />
            )}
          </div>
        )}

        {/* No results message */}
        {!currentProduct && !searchLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có kết quả tìm kiếm
            </h3>
            <p className="text-gray-500">
              Nhập mã sản phẩm ở trên để bắt đầu tra cứu
            </p>
          </div>
        )}
      </div>
    </div>
  );
};