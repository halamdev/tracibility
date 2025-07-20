import React, { useState } from 'react';
import { MapPin, FileText, Plus } from 'lucide-react';

interface AddStepFormProps {
  productId: string;
  onSubmit: (productId: string, location: string, description: string, status:number) => Promise<void>;
  loading: boolean;
  isAuthorized: boolean;
}

export const AddStepForm: React.FC<AddStepFormProps> = ({
  productId,
  onSubmit,
  loading,
  isAuthorized,
}) => {
  const [formData, setFormData] = useState({
    location: '',
    description: '',
    status: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.location.trim()) {
      newErrors.location = 'Địa điểm không được để trống';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả không được để trống';
    }

    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit(productId, formData.location, formData.description,formData.status);
      setFormData({ location: '', description: '', status: 0, });
      setErrors({});
    } catch (error) {
      // Error handled by parent component
    }
  };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  const newValue = name === 'status' ? parseInt(value) : value;

  setFormData(prev => ({ ...prev, [name]: newValue }));

  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Plus className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Thêm bước truy xuất</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="location" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <MapPin className="w-4 h-4" />
            <span>Địa điểm</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
              errors.location ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nhập địa điểm thực hiện"
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            <span>Mô tả</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Mô tả chi tiết hành động được thực hiện"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <span>Trạng thái</span>
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
              errors.status ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">-- Chọn trạng thái --</option>
            <option value="0">Sản xuất tại nhà máy, (Manufactured)</option>
            <option value="1">Đã kiểm định chất lượng (Inspected)</option>
            <option value="2">Đóng gói thành phẩm (Packaged)</option>
            <option value="3">Được lưu chữ trong kho (Stored)</option>
            <option value="4">Đã chuyển đến kho hoặc đại lý (Shipped)</option>
            <option value="5">Đã nhận hàng từ điểm giao (Received)</option>
            <option value="6">Bán đến (Sold)</option>
            <option value="7">Trả hàng (Returned)</option>
            <option value="8">Hủy sản phẩm  (Disposed)</option>
          </select>
          {errors.status && (
            <p className="text-red-500 text-sm mt-1">{errors.status}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>{loading ? 'Đang thêm...' : 'Thêm bước'}</span>
        </button>
      </form>
    </div>
  );
};