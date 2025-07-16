import React from 'react';
import { Package, User, Hash, FileText, Calendar, MapPin } from 'lucide-react';
import { Product, Step } from '../types/contract';

interface ProductDetailsProps {
  productId: string;
  product: Product;
  steps: Step[];
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  productId,
  product,
  steps,
}) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6">
      {/* Product Info */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Package className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Thông tin sản phẩm</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <Hash className="w-4 h-4" />
                <span>Mã sản phẩm</span>
              </label>
              <p className="bg-gray-50 px-4 py-2 rounded-lg border font-mono">{productId}</p>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <Package className="w-4 h-4" />
                <span>Tên sản phẩm</span>
              </label>
              <p className="bg-gray-50 px-4 py-2 rounded-lg border">{product.name}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4" />
                <span>Nhà sản xuất</span>
              </label>
              <p className="bg-gray-50 px-4 py-2 rounded-lg border font-mono">{formatAddress(product.creator)}</p>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                <span>IPFS Hash</span>
              </label>
              <p className="bg-gray-50 px-4 py-2 rounded-lg border font-mono text-sm break-all">{product.ipfsHash}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 font-semibold">
            Tổng số bước truy xuất: {Number(product.stepCount)} bước
          </p>
        </div>
      </div>

      {/* Traceability Timeline */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Lịch sử truy xuất</h2>
        </div>

        {steps.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có bước truy xuất nào được ghi nhận</p>
          </div>
        ) : (
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index !== steps.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 bg-gray-50 rounded-lg p-4 border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>Địa điểm</span>
                        </div>
                        <p className="text-gray-900 font-medium">{step.location}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span>Thời gian</span>
                        </div>
                        <p className="text-gray-900">{formatTimestamp(step.timestamp)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <FileText className="w-4 h-4" />
                        <span>Mô tả</span>
                      </div>
                      <p className="text-gray-900">{step.description}</p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-1">
                        <User className="w-4 h-4" />
                        <span>Người thực hiện</span>
                      </div>
                      <p className="text-gray-600 font-mono text-sm">{formatAddress(step.actor)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};