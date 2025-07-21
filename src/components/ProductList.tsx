import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Search, Filter, User, Calendar, MapPin, Eye, Plus, Image, QrCode, Download } from 'lucide-react';
import { useContractContext } from '../contexts/ContractContext';
import { Product, STEP_STATUS_LABELS, STEP_STATUS_COLORS } from '../types/contract';
import { ProductModal } from './ProductModal';
import { toast } from 'react-toastify';
import QRCode from 'qrcode';

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

  const { 
    getProductsByCreator, 
    getProduct, 
    walletState, 
    createProduct,
    loading: contractLoading 
  } = useContractContext();

  const [products, setProducts] = useState<ProductWithId[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | 'all'>('all');

  const generateAndDownloadQR = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const url = `${window.location.origin}/search?id=${productId}`;
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      
      const link = document.createElement('a');
      link.download = `qr-${productId}.png`;
      link.href = qrDataUrl;
      link.click();
      
      toast.success('QR Code đã được tải xuống!');
    } catch (error) {
      console.error('Lỗi tạo QR code:', error);
      toast.error('Lỗi tạo QR Code');
    }
  };

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
      let creator = creatorFilter;
      if (!creator) {
        creator = walletState.address || null;
      }
      if (creator) {
        productIds = await getProductsByCreator(creator);
      } else {
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
              metadata: metadata ?? null
            };
          }
        } catch (error) {
          console.warn(`Lỗi tải sản phẩm ${id}:`, error);
        }
        return null;
      });

      const results = await Promise.all(productPromises);
      const validProducts = results.filter((p) => p !== null) as ProductWithId[];
      setProducts(validProducts);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Helper function để lấy step status cuối cùng
  const getLatestStepStatus = (product: Product): number | null => {
    if (!product.steps || product.steps.length === 0) {
      return null;
    }
    return product.steps[product.steps.length - 1].status;
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

    // Filter by step status
    if (statusFilter !== 'all') {
      // Lọc theo step status cuối cùng
      filtered = filtered.filter(product => {
        const latestStepStatus = getLatestStepStatus(product.data);
        return latestStepStatus === statusFilter;
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, statusFilter]);

  const handleProductClick = (productId: string) => {
    navigate(`/search?id=${productId}`);
  };

  const handleCreatorClick = (creatorAddress: string) => {
    navigate(`/products?creator=${creatorAddress}`);
  };

  const handleCreateProduct = async (productId: string, name: string, ipfsHash: string, location: string) => {
    const result = await createProduct(productId, name, ipfsHash, location);
    if (result) {
      toast.success('Sản phẩm đã được tạo thành công!');
      // Reload products list
      await loadProducts();
    }
  };

  const ImagePreview: React.FC<{ metadata: any; productName: string }> = ({ metadata, productName }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    if (!metadata?.image) {
      return (
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
          <Image className="w-6 h-6 text-gray-400" />
        </div>
      );
    }

    const getIpfsUrl = (hash: string) => {
      const cleanHash = hash.replace('ipfs://', '');
      return `https://gateway.pinata.cloud/ipfs/${cleanHash}`;
    };

    return (
      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {!imageError ? (
          <img
            src={getIpfsUrl(metadata.image)}
            alt={productName}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </div>
    );
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {creatorFilter || walletState.address
              ? `Sản phẩm của ${formatAddress(creatorFilter || walletState.address || '')}`
              : 'Danh sách sản phẩm'}
          </h1>
          
          {walletState.isAuthorized && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Tạo sản phẩm mới</span>
            </button>
          )}
        </div>
        <p className="text-gray-600">
          {(creatorFilter || walletState.address)
            ? 'Tất cả sản phẩm được tạo bởi địa chỉ này'
            : 'Tìm kiếm và lọc sản phẩm theo nhu cầu'}
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
              {Object.entries(STEP_STATUS_LABELS).map(([value, label]) => (
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
        <div className="space-y-4">
          {filteredProducts.map((product) => {
            const latestStepStatus = getLatestStepStatus(product.data);
            return (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="flex items-center space-x-4 p-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <ImagePreview 
                      metadata={product.metadata} 
                      productName={product.metadata?.name || product.data.name}
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    {/* Header with ID and Status */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2 min-w-0">
                        <Package className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="font-mono text-sm text-gray-600 truncate">{product.id}</span>
                      </div>
                      {latestStepStatus !== null ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STEP_STATUS_COLORS[latestStepStatus as keyof typeof STEP_STATUS_COLORS]}`}>
                          {STEP_STATUS_LABELS[latestStepStatus as keyof typeof STEP_STATUS_LABELS]}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 whitespace-nowrap">
                          Chưa cập nhật
                        </span>
                      )}
                    </div>

                    {/* Product Name */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {product.metadata?.name || product.data.name}
                    </h3>

                    {/* Description */}
                    {product.metadata?.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-1">
                        {product.metadata.description}
                      </p>
                    )}

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm mb-3">
                      <div className="flex items-center space-x-2 text-gray-600 min-w-0">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{product.metadata?.location || product.data.location}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-600 min-w-0">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreatorClick(product.data.creator);
                          }}
                          className="hover:text-blue-600 transition-colors truncate text-left"
                        >
                          {formatAddress(product.data.creator)}
                        </button>
                      </div>

                      {product.metadata?.createdAt && (
                        <div className="flex items-center space-x-2 text-gray-600 min-w-0">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{new Date(product.metadata.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {product.data.steps.length} bước truy xuất
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => generateAndDownloadQR(product.id, e)}
                          className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 text-sm transition-colors"
                          title="Tải QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                          <span className="hidden sm:inline">QR</span>
                        </button>
                        <div className="flex items-center space-x-1 text-blue-600 text-sm">
                          <Eye className="w-4 h-4" />
                          <span className="font-medium hidden sm:inline">Xem chi tiết</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Product Modal */}
      <ProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProduct}
        loading={contractLoading}
        isAuthorized={walletState.isAuthorized}
      />
    </div>
  );
};