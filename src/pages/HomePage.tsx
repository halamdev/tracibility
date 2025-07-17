import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Shield, Clock, Globe } from 'lucide-react';
import { useContractContext } from '../contexts/ContractContext';

export const HomePage: React.FC = () => {
  const { walletState } = useContractContext();

  const features = [
    {
      icon: Package,
      title: 'Tạo sản phẩm',
      description: 'Đăng ký sản phẩm mới với thông tin chi tiết và metadata IPFS',
      link: '/create',
      color: 'blue',
    },
    {
      icon: Search,
      title: 'Tra cứu sản phẩm',
      description: 'Tìm kiếm và xem lịch sử truy xuất của bất kỳ sản phẩm nào',
      link: '/search',
      color: 'green',
    },
    {
      icon: Shield,
      title: 'Quản lý quyền',
      description: 'Cấp phát và thu hồi quyền truy cập cho các nhà cung cấp',
      link: '/admin',
      color: 'purple',
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Bảo mật cao',
      description: 'Dữ liệu được mã hóa và lưu trữ trên blockchain Ethereum',
    },
    {
      icon: Clock,
      title: 'Theo dõi thời gian thực',
      description: 'Cập nhật trạng thái sản phẩm ngay lập tức và minh bạch',
    },
    {
      icon: Globe,
      title: 'Toàn cầu',
      description: 'Truy cập từ bất kỳ đâu với kết nối internet và ví crypto',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl">
            <Package className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-[1.4]">
            Traceability System
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Hệ thống truy xuất nguồn gốc sản phẩm sử dụng công nghệ blockchain để đảm bảo 
          tính minh bạch, an toàn và không thể thay đổi trong chuỗi cung ứng
        </p>
        
        {!walletState.isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-yellow-800 font-medium">
              Vui lòng kết nối ví MetaMask để bắt đầu sử dụng
            </p>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const isDisabled = !walletState.isConnected || 
            (feature.link === '/create' && !walletState.isAuthorized) ||
            (feature.link === '/admin' && !walletState.isOwner);
          
          return (
            <div key={index} className="relative">
              <Link
                to={isDisabled ? '#' : feature.link}
                className={`block bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition-all duration-300 ${
                  isDisabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-xl hover:-translate-y-1'
                }`}
                onClick={(e) => isDisabled && e.preventDefault()}
              >
                <div className={`p-3 bg-${feature.color}-100 rounded-lg w-fit mb-4`}>
                  <Icon className={`w-8 h-8 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
                {isDisabled && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">
                      {feature.link === '/admin' ? 'Chỉ owner' : 'Cần quyền'}
                    </div>
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Benefits Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Tại sao chọn Traceability System?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="text-center">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl w-fit mx-auto mb-4">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      {walletState.isConnected && (
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Trạng thái kết nối</h3>
            <p className="text-blue-100">Đã kết nối thành công</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Quyền truy cập</h3>
            <p className="text-green-100">
              {walletState.isOwner ? 'Chủ hợp đồng' : 
               walletState.isAuthorized ? 'Có quyền tạo' : 'Chỉ xem'}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Smart Contract</h3>
            <p className="text-purple-100 font-mono text-sm">0xe96b...72ee</p>
          </div>
        </div>
      )}
    </div>
  );
};