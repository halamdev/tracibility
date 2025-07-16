import React, { useState } from 'react';
import { Settings, UserPlus, UserMinus, Shield } from 'lucide-react';

interface AdminPanelProps {
  onAuthorize: (address: string) => Promise<void>;
  onRevoke: (address: string) => Promise<void>;
  loading: boolean;
  isOwner: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onAuthorize,
  onRevoke,
  loading,
  isOwner,
}) => {
  const [address, setAddress] = useState('');
  const [action, setAction] = useState<'authorize' | 'revoke'>('authorize');
  const [error, setError] = useState('');

  const validateAddress = (addr: string) => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(addr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!address.trim()) {
      setError('Địa chỉ không được để trống');
      return;
    }

    if (!validateAddress(address)) {
      setError('Địa chỉ Ethereum không hợp lệ');
      return;
    }

    try {
      if (action === 'authorize') {
        await onAuthorize(address);
      } else {
        await onRevoke(address);
      }
      setAddress('');
    } catch (error) {
      // Error handled by parent component
    }
  };

  if (!isOwner) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Settings className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Quản lý quyền truy cập</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
            <Shield className="w-4 h-4" />
            <span>Địa chỉ ví</span>
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (error) setError('');
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0x..."
          />
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-3 block">Hành động</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAction('authorize')}
              className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition-all ${
                action === 'authorize'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
              }`}
            >
              <UserPlus className="w-5 h-5" />
              <span>Cấp quyền</span>
            </button>
            
            <button
              type="button"
              onClick={() => setAction('revoke')}
              className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition-all ${
                action === 'revoke'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-red-300'
              }`}
            >
              <UserMinus className="w-5 h-5" />
              <span>Thu hồi quyền</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !address.trim()}
          className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
            action === 'authorize'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {action === 'authorize' ? (
            <UserPlus className="w-5 h-5" />
          ) : (
            <UserMinus className="w-5 h-5" />
          )}
          <span>
            {loading ? 'Đang xử lý...' : action === 'authorize' ? 'Cấp quyền' : 'Thu hồi quyền'}
          </span>
        </button>
      </form>
    </div>
  );
};