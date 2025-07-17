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
    description: '',
    image: null as File | null,
    certificate: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId.trim()) {
      newErrors.productId = 'Mã sản phẩm không được để trống';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Tên sản phẩm không được để trống';
    }
    if (!formData.certificate) {
      newErrors.certificate = 'Vui lòng chọn chứng nhận sản phẩm';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Tạo metadata JSON
      const metadata: any = {
        productId: formData.productId,
        name: formData.name,
        description: formData.description,
      };

      // Upload files lên IPFS (ví dụ dùng Web3.Storage)
      // Bạn cần cài web3.storage: npm install web3.storage
      // import { Web3Storage } from 'web3.storage';
      // const client = new Web3Storage({ token: 'YOUR_TOKEN' });

      // Chuẩn bị mảng file
      const files: File[] = [];
      if (formData.image) files.push(new File([formData.image], 'image.jpg'));
      if (formData.certificate) files.push(new File([formData.certificate], 'certificate.jpg'));

      // Upload files lên IPFS
      // const cid = await client.put(files);
      // metadata.image = `ipfs://${cid}/image.jpg`;
      // metadata.certificate = `ipfs://${cid}/certificate.jpg`;

      // Upload metadata JSON lên IPFS
      // const metadataFile = new File([JSON.stringify(metadata)], 'metadata.json');
      // const metadataCid = await client.put([metadataFile]);
      // const ipfsHash = metadataCid;

      // Demo: chỉ gửi metadata JSON (chưa upload thực tế)
      const ipfsHash = 'demo-ipfs-hash';

      await onSubmit(formData.productId, formData.name, ipfsHash);
      setFormData({ productId: '', name: '', description: '', image: null, certificate: null });
      setErrors({});
    } catch (error) {
      // Error handled by parent component
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, files } = e.target as any;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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
          <label htmlFor="description" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            <span>Giới thiệu sản phẩm</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nhập giới thiệu sản phẩm"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="image" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            <span>Hình ảnh sản phẩm</span>
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.image ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>

        <div>
          <label htmlFor="certificate" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            <span>Chứng nhận sản phẩm</span>
          </label>
          <input
            type="file"
            id="certificate"
            name="certificate"
            accept="image/*,application/pdf"
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.certificate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.certificate && (
            <p className="text-red-500 text-sm mt-1">{errors.certificate}</p>
          )}
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