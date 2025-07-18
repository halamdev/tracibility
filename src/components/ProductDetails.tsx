import React, { useState, useEffect } from 'react';
import { Package, User, Hash, FileText, Calendar, MapPin, Image, Award, ExternalLink, Download, Eye, EyeOff } from 'lucide-react';
import { Product, Step } from '../types/contract';

interface ProductDetailsProps {
  productId: string;
  product: Product;
  steps: Step[];
}

interface ProductMetadata {
  productId: string;
  name: string;
  description: string;
  image: string | null;
  certificate: string | null;
  createdAt: string;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  productId,
  product,
  steps,
}) => {
  const [metadata, setMetadata] = useState<ProductMetadata | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [showTechnicalInfo, setShowTechnicalInfo] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString('vi-VN');
  };

  const getIpfsUrl = (hash: string) => {
    // Remove ipfs:// prefix if present
    const cleanHash = hash.replace('ipfs://', '');
    return `https://gateway.pinata.cloud/ipfs/${cleanHash}`;
  };

  const fetchMetadata = async () => {
    try {
      setLoadingMetadata(true);
      setMetadataError(null);

      const metadataUrl = getIpfsUrl(product.ipfsHash);
      const response = await fetch(metadataUrl);
      
      if (!response.ok) {
        throw new Error('Không thể tải metadata từ IPFS');
      }

      const data = await response.json();
      setMetadata(data);
    } catch (error: any) {
      console.error('Lỗi tải metadata:', error);
      setMetadataError(error.message || 'Lỗi tải thông tin sản phẩm');
    } finally {
      setLoadingMetadata(false);
    }
  };

  useEffect(() => {
    if (product.ipfsHash) {
      fetchMetadata();
    }
  }, [product.ipfsHash]);

  const ImageViewer: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    return (
      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {!imageError ? (
          <img
            src={getIpfsUrl(src)}
            alt={alt}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <Image className="w-12 h-12 mb-2" />
            <p className="text-sm">Không thể tải hình ảnh</p>
          </div>
        )}
      </div>
    );
  };

  const CertificateViewer: React.FC<{ src: string }> = ({ src }) => {
    const [certError, setCertError] = useState(false);
    const isPdf = src.toLowerCase().includes('.pdf') || src.includes('application/pdf');

    if (certError) {
      return (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <Award className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Không thể tải chứng chỉ</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {isPdf ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <Award className="w-12 h-12 mx-auto text-red-600 mb-3" />
            <h4 className="font-semibold text-red-800 mb-2">Chứng chỉ PDF</h4>
            <p className="text-red-700 text-sm mb-4">
              Nhấp vào nút bên dưới để xem hoặc tải xuống chứng chỉ
            </p>
            <div className="flex justify-center space-x-3">
              <a
                href={getIpfsUrl(src)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Xem PDF</span>
              </a>
              <a
                href={getIpfsUrl(src)}
                download
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Tải xuống</span>
              </a>
            </div>
          </div>
        ) : (
          <ImageViewer src={src} alt="Chứng chỉ sản phẩm" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Product Info */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Thông tin sản phẩm</h2>
          </div>
          <button
            onClick={() => setShowTechnicalInfo(!showTechnicalInfo)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {showTechnicalInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showTechnicalInfo ? 'Ẩn' : 'Hiện'} thông tin kỹ thuật</span>
          </button>
        </div>

        {loadingMetadata ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Đang tải thông tin sản phẩm...</span>
          </div>
        ) : metadataError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-2">
              <FileText className="w-8 h-8 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Lỗi tải thông tin</h3>
            <p className="text-red-700 mb-4">{metadataError}</p>
            <button
              onClick={fetchMetadata}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : metadata ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <Hash className="w-4 h-4" />
                    <span>Mã sản phẩm</span>
                  </label>
                  <p className="bg-gray-50 px-4 py-3 rounded-lg border font-mono text-lg">{productId}</p>
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <Package className="w-4 h-4" />
                    <span>Tên sản phẩm</span>
                  </label>
                  <p className="bg-gray-50 px-4 py-3 rounded-lg border text-lg font-medium">{metadata.name}</p>
                </div>

                {metadata.description && (
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="w-4 h-4" />
                      <span>Mô tả</span>
                    </label>
                    <div className="bg-gray-50 px-4 py-3 rounded-lg border">
                      <p className="text-gray-900 whitespace-pre-wrap">{metadata.description}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    <span>Nhà sản xuất</span>
                  </label>
                  <p className="bg-gray-50 px-4 py-3 rounded-lg border font-mono">{formatAddress(product.creator)}</p>
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>Ngày tạo</span>
                  </label>
                  <p className="bg-gray-50 px-4 py-3 rounded-lg border">
                    {new Date(metadata.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Product Image */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <Image className="w-4 h-4" />
                  <span>Hình ảnh sản phẩm</span>
                </label>
                {metadata.image ? (
                  <ImageViewer src={metadata.image} alt={metadata.name} />
                ) : (
                  <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Image className="w-12 h-12 mx-auto mb-2" />
                      <p>Không có hình ảnh</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Certificate */}
            {metadata.certificate && (
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                  <Award className="w-4 h-4" />
                  <span>Chứng chỉ sản phẩm</span>
                </label>
                <CertificateViewer src={metadata.certificate} />
              </div>
            )}

            {/* Technical Info */}
            {showTechnicalInfo && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin kỹ thuật</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">IPFS Hash (Metadata)</label>
                    <div className="bg-gray-50 px-3 py-2 rounded border font-mono text-sm break-all">
                      {product.ipfsHash}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Địa chỉ nhà sản xuất</label>
                    <div className="bg-gray-50 px-3 py-2 rounded border font-mono text-sm">
                      {product.creator}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <p className="text-blue-800 font-semibold">
                📊 Tổng số bước truy xuất: {Number(product.stepCount)} bước
              </p>
            </div>
          </div>
        ) : null}
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
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bước truy xuất</h3>
            <p>Sản phẩm này chưa có bước truy xuất nào được ghi nhận</p>
          </div>
        ) : (
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index !== steps.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-20 bg-gradient-to-b from-blue-400 to-purple-400"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span>Địa điểm</span>
                        </div>
                        <p className="text-gray-900 font-medium text-lg">{step.location}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <span>Thời gian</span>
                        </div>
                        <p className="text-gray-900 font-medium">{formatTimestamp(step.timestamp)}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span>Mô tả</span>
                      </div>
                      <div className="bg-white rounded-lg p-4 border">
                        <p className="text-gray-900 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-300">
                      <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-1">
                        <User className="w-4 h-4 text-orange-600" />
                        <span>Người thực hiện</span>
                      </div>
                      <p className="text-gray-600 font-mono text-sm bg-white px-3 py-1 rounded border inline-block">
                        {formatAddress(step.actor)}
                      </p>
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