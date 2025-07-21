import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ProductForm } from './ProductForm';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productId: string, name: string, ipfsHash: string, location: string) => Promise<void>;
  loading: boolean;
  isAuthorized: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  isAuthorized,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (productId: string, name: string, ipfsHash: string, location: string) => {
    setIsSubmitting(true);
    try {
      await onSubmit(productId, name, ipfsHash, location);
      onClose(); // Đóng modal sau khi tạo thành công
    } catch (error) {
      // Error được xử lý bởi component cha
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Tạo sản phẩm mới</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6">
          <ProductForm
            onSubmit={handleSubmit}
            loading={loading || isSubmitting}
            isAuthorized={isAuthorized}
          />
        </div>
      </div>
    </div>
  );
};