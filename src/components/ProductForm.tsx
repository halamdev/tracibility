import React, { useState } from 'react';
import { Package, Hash, FileText, Plus, Upload, Image, Award, X, CheckCircle } from 'lucide-react';

function generateProductId() {
  return 'SP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

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
    productId: generateProductId(),
    name: '',
    description: '',
    image: null as File | null,
    certificate: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    image?: 'uploading' | 'success' | 'error';
    certificate?: 'uploading' | 'success' | 'error';
    metadata?: 'uploading' | 'success' | 'error';
  }>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Tên sản phẩm không được để trống';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    setErrors({});
    setCreatedId(null);
    setUploadProgress({});

    const token = import.meta.env.VITE_PINATA_JWT;

    // 1. Upload image lên Pinata (nếu có)
    let imageHash: string | null = null;
    if (formData.image) {
      setUploadProgress(prev => ({ ...prev, image: 'uploading' }));
      const imgForm = new FormData();
      imgForm.append('file', formData.image);

      const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        body: imgForm,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error('Lỗi upload hình ảnh lên IPFS');
      }

      imageHash = data.IpfsHash;
      setUploadProgress(prev => ({ ...prev, image: 'success' }));
    }

    // 2. Upload certificate lên Pinata
    setUploadProgress(prev => ({ ...prev, certificate: 'uploading' }));
    const certForm = new FormData();
    certForm.append('file', formData.certificate!);

    const certRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      body: certForm,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const certData = await certRes.json();

    if (!certRes.ok) {
      throw new Error('Lỗi upload chứng nhận lên IPFS');
    }

    const certHash = certData.IpfsHash;
    setUploadProgress(prev => ({ ...prev, certificate: 'success' }));

    // 3. Tạo metadata object
    const metadata = {
      productId: formData.productId,
      name: formData.name,
      description: formData.description,
      image: imageHash ? `ipfs://${imageHash}` : null,
      certificate: `ipfs://${certHash}`,
      createdAt: new Date().toISOString(),
    };


    // 4. Upload metadata.json lên Pinata
    setUploadProgress(prev => ({ ...prev, metadata: 'uploading' }));
    const metadataForm = new FormData();
    const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    metadataForm.append('file', blob, 'metadata.json');

    const metadataRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      body: metadataForm,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const metadataJson = await metadataRes.json();

    if (!metadataRes.ok) {
      throw new Error('Lỗi upload metadata lên IPFS');
    }

    const ipfsHash = metadataJson.IpfsHash;
    setUploadProgress(prev => ({ ...prev, metadata: 'success' }));

    // 5. Gọi smart contract qua onSubmit prop
    await onSubmit(formData.productId, formData.name, ipfsHash);

    setCreatedId(formData.productId);
    setFormData({
      productId: generateProductId(),
      name: '',
      description: '',
      image: null,
      certificate: null,
    });
    setUploadProgress({});
  } catch (error: any) {
    setErrors({ submit: error.message || 'Đã có lỗi xảy ra khi tạo sản phẩm' });
    setUploadProgress({});
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

  const removeFile = (fieldName: 'image' | 'certificate') => {
    setFormData(prev => ({ ...prev, [fieldName]: null }));
    if (errors[fieldName]) setErrors(prev => ({ ...prev, [fieldName]: '' }));
  };

  const FileUploadBox: React.FC<{
    name: 'image' | 'certificate';
    label: string;
    icon: React.ComponentType<any>;
    accept: string;
    file: File | null;
    required?: boolean;
    uploadStatus?: 'uploading' | 'success' | 'error';
  }> = ({ name, label, icon: Icon, accept, file, required, uploadStatus }) => (
    <div>
      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      
      {!file ? (
        <label className={`relative block w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}>
          <input
            type="file"
            name={name}
            accept={accept}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">Nhấp để chọn file</span>
              <span> hoặc kéo thả vào đây</span>
            </div>
            <p className="text-xs text-gray-500">
              {accept.includes('image') ? 'PNG, JPG, GIF tối đa 10MB' : 'PDF, PNG, JPG tối đa 10MB'}
            </p>
          </div>
        </label>
      ) : (
        <div className={`relative border-2 rounded-lg p-4 ${
          uploadStatus === 'success' ? 'border-green-300 bg-green-50' :
          uploadStatus === 'uploading' ? 'border-blue-300 bg-blue-50' :
          uploadStatus === 'error' ? 'border-red-300 bg-red-50' :
          'border-gray-300 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                uploadStatus === 'success' ? 'bg-green-100' :
                uploadStatus === 'uploading' ? 'bg-blue-100' :
                uploadStatus === 'error' ? 'bg-red-100' :
                'bg-gray-100'
              }`}>
                {uploadStatus === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : uploadStatus === 'uploading' ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Icon className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                  {uploadStatus === 'uploading' && ' - Đang upload...'}
                  {uploadStatus === 'success' && ' - Upload thành công'}
                  {uploadStatus === 'error' && ' - Upload thất bại'}
                </p>
              </div>
            </div>
            {uploadStatus !== 'uploading' && (
              <button
                type="button"
                onClick={() => removeFile(name)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
      
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
      )}
    </div>
  );

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

      {createdId && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-800 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Sản phẩm đã được tạo thành công!</span>
          </div>
          <p className="text-green-700">
            Mã sản phẩm: <span className="font-mono font-semibold">{createdId}</span>
          </p>
        </div>
      )}

      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-semibold">{errors.submit}</p>
        </div>
      )}

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
            readOnly
            className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-600 font-mono"
          />
        </div>

        <div>
          <label htmlFor="name" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <Package className="w-4 h-4" />
            <span>Tên sản phẩm</span>
            <span className="text-red-500">*</span>
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
            <span>Mô tả sản phẩm</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="Nhập mô tả chi tiết về sản phẩm"
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-6">
          <FileUploadBox
            name="image"
            label="Hình ảnh sản phẩm"
            icon={Image}
            accept="image/*"
            file={formData.image}
            uploadStatus={uploadProgress.image}
          />

          <FileUploadBox
            name="certificate"
            label="Chứng nhận sản phẩm"
            icon={Award}
            accept="image/*,application/pdf"
            file={formData.certificate}
            uploadStatus={uploadProgress.certificate}
          />
        </div>

        <button
          type="submit"
          disabled={loading || Object.values(uploadProgress).includes('uploading')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {Object.values(uploadProgress).includes('uploading') ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Đang upload...</span>
            </>
          ) : loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Đang tạo...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>Tạo sản phẩm</span>
            </>
          )}
        </button>
      </form>

      {/* IPFS Info */}
      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h3 className="text-sm font-semibold text-purple-800 mb-2">
          📡 Thông tin IPFS
        </h3>
        <ul className="space-y-1 text-purple-700 text-sm">
          <li>• Files sẽ được upload lên Pinata IPFS để lưu trữ phi tập trung</li>
          <li>• Metadata bao gồm thông tin sản phẩm và links đến files</li>
          <li>• IPFS hash sẽ được lưu trên blockchain để đảm bảo tính bất biến</li>
          <li>• Cần cấu hình VITE_PINATA_JWT trong environment variables</li>
        </ul>
      </div>
    </div>
  );
};