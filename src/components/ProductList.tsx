import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Search, Filter, User, Calendar, MapPin, Eye } from 'lucide-react';
import { useContractContext } from '../contexts/ContractContext';
import { Product, PRODUCT_STATUS_LABELS, PRODUCT_STATUS_COLORS } from '../types/contract';

interface ProductWithId {
  id: string;
  data: Product;
  metadata?: {
    name: string;
    description: string;
    location: string;
    createdAt: string;
  };
}

export const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const creatorFilter = searchParams.get('creator');
  
  const { getProductsByCreator, getProduct } = useContractContext();
  
  const [products, setProducts] = useState<ProductWithId[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | 'all'>('all');

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getIpfsUrl = (hash: string) => {
    const cleanHash = hash.replace('ipfs://', '');
    return `https://gateway.pinata.cloud/ipfs/${cleanHash}`;
  };

  const fetchMetadata = async (ipfsHash: string) => {
    try {
      const response = await fetch(getIpfsUrl(ipfsHash));
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Không thể tải metadata:', error);
    }
    return null;
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      let productIds: string[] = [];
      
      if (creatorFilter) {
        productIds = await getProductsByCreator(creatorFilter);
      } else {
        // Nếu không có creator filter, có thể load tất cả sản phẩm
        // Hiện tại contract chưa có hàm getAllProducts, nên ta sẽ để trống
        productIds = [];
      }

      const productPromises = productIds.map(async (id) => {
        try {
          const productData = await getProduct(id);
          if (productData) {
            const metadata = await fetchMetadata(productData.ipfsHash);
            return {
              id,
              data: productData,
              metadata
            };
          }
          return null;
        } catch (error) {
          console.warn(`Lỗi tải sản phẩm ${id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(productPromises);
      const validProducts = results.filter((p): p is ProductWithId => p !== null);
      
      setProducts(validProducts);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [creatorFilter]);

  useEffect(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(product => 
        product.metadata?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => product.data.status === statusFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, statusFilter]);

  const handleProductClick = (productId: string) => {
    navigate(`/search?id=${productId}`);
  };

  const handleCreatorClick = (creatorAddress: string) => {
    navigate(`/products?creator=${creatorAddress}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Đang tải danh sách sản phẩm...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadProducts}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {creatorFilter ? `Sản phẩm của ${formatAddress(creatorFilter)}` : 'Danh sách sản phẩm'}
        </h1>
        <p className="text-gray-600">
          {creatorFilter 
            ? 'Tất cả sản phẩm được tạo bởi địa chỉ này'
            : 'Tìm kiếm và lọc sản phẩm theo nhu cầu'
          }
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
              <Search className="w-4 h-4" />
              <span>Tìm kiếm</span>
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Tìm theo tên sản phẩm hoặc mã sản phẩm..."
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
              <Filter className="w-4 h-4" />
              <span>Lọc theo trạng thái</span>
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="all">Tất cả trạng thái</option>
              {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-6">
        <p className="text-gray-600">
          Hiển thị {filteredProducts.length} / {products.length} sản phẩm
        </p>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Package className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {products.length === 0 ? 'Chưa có sản phẩm nào' : 'Không tìm thấy sản phẩm'}
          </h3>
          <p className="text-gray-500">
            {products.length === 0 
              ? 'Chưa có sản phẩm nào được tạo bởi địa chỉ này'
              : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="font-mono text-sm text-gray-600">{product.id}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRODUCT_STATUS_COLORS[product.data.status]}`}>
                    {PRODUCT_STATUS_LABELS[product.data.status]}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {product.metadata?.name || product.data.name}
                </h3>

                {product.metadata?.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {product.metadata.description}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{product.metadata?.location || product.data.location}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreatorClick(product.data.creator);
                      }}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {formatAddress(product.data.creator)}
                    </button>
                  </div>

                  {product.metadata?.createdAt && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(product.metadata.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {product.data.steps.length} bước truy xuất
                    </span>
                    <div className="flex items-center space-x-1 text-blue-600">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Xem chi tiết</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};