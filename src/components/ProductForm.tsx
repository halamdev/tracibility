import React, { useState } from 'react';
import { Package, Hash, FileText, Plus } from 'lucide-react';

interface ProductFormProps {
  onSubmit: (productId: string, name: string, ipfsHash: string) => Promise<void>;
  loading: boolean;
  isAuthorized: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  loading,
  isAuthorized,
}) => {
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    ipfsHash: '',
  });
  const [file, setFile] = useState<File | null>(null);
const [uploading, setUploading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId.trim()) {
      newErrors.productId = 'Mã sản phẩm không được để trống';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Tên sản phẩm không được để trống';
    }

    if (!formData.ipfsHash.trim()) {
      newErrors.ipfsHash = 'IPFS Hash không được để trống';
    } else if (formData.ipfsHash.length < 10) {
      newErrors.ipfsHash = 'IPFS Hash không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
const handleUploadToPinata = async () => {
  if (!file) return;

  setUploading(true);

  const formData = new FormData();
  formData.append('file', file);
console.log('JWT:', import.meta.env.VITE_PINATA_JWT);

  try {
    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
      },
    });

    const data = await res.json();

    if (res.ok) {
      setFormData(prev => ({ ...prev, ipfsHash: data.IpfsHash }));
    } else {
      console.error('Pinata Error:', data);
      alert('Upload thất bại, xem console để biết chi tiết.');
    }
  } catch (err) {
    console.error('Upload error:', err);
  } finally {
    setUploading(false);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit(formData.productId, formData.name, formData.ipfsHash);
      setFormData({ productId: '', name: '', ipfsHash: '' });
      setErrors({});
    } catch (error) {
      // Error handled by parent component
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isAuthorized) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-yellow-800">
          <Package className="w-5 h-5" />
          <span className="font-semibold">Không có quyền tạo sản phẩm</span>
        </div>
        <p className="text-yellow-700 mt-2">
          Bạn cần được cấp quyền từ chủ hợp đồng để có thể tạo sản phẩm mới.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Plus className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Tạo sản phẩm mới</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="productId" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <Hash className="w-4 h-4" />
            <span>Mã sản phẩm</span>
          </label>
          <input
            type="text"
            id="productId"
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.productId ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nhập mã sản phẩm duy nhất"
          />
          {errors.productId && (
            <p className="text-red-500 text-sm mt-1">{errors.productId}</p>
          )}
        </div>

        <div>
          <label htmlFor="name" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <Package className="w-4 h-4" />
            <span>Tên sản phẩm</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nhập tên sản phẩm"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="ipfsHash" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            <span>IPFS Hash</span>
          </label>
          <input
            type="text"
            id="ipfsHash"
            name="ipfsHash"
            value={formData.ipfsHash}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.ipfsHash ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nhập IPFS hash của metadata"
          />
          {errors.ipfsHash && (
            <p className="text-red-500 text-sm mt-1">{errors.ipfsHash}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            Hash IPFS chứa metadata, hình ảnh và chứng nhận của sản phẩm
          </p>
        </div>
<div className="mt-3">
  <input
    type="file"
    onChange={(e) => setFile(e.target.files?.[0] || null)}
    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
      file:rounded-md file:border-0 file:text-sm file:font-semibold
      file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
  />
  <button
    type="button"
    onClick={handleUploadToPinata}
    disabled={!file || uploading}
    className="mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
  >
    {uploading ? 'Đang tải lên...' : 'Tải lên và tạo IPFS Hash'}
  </button>
</div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>{loading ? 'Đang tạo...' : 'Tạo sản phẩm'}</span>
        </button>
      </form>
    </div>
  );
};