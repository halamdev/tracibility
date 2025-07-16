import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface ProductSearchProps {
  onSearch: (productId: string) => void;
  loading: boolean;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  onSearch,
  loading,
}) => {
  const [productId, setProductId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productId.trim()) {
      onSearch(productId.trim());
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Search className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Tra cứu sản phẩm</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-4">
        <div className="flex-1">
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            placeholder="Nhập mã sản phẩm để tra cứu"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !productId.trim()}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Search className="w-5 h-5" />
          <span>{loading ? 'Đang tìm...' : 'Tra cứu'}</span>
        </button>
      </form>
    </div>
  );
};