import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Home, Search, Plus, Settings, List } from 'lucide-react';
import { WalletConnection } from '../WalletConnection';
import { NetworkInfo } from '../NetworkInfo';
import { useContractContext } from '../../contexts/ContractContext';

export const Header: React.FC = () => {
  const location = useLocation();
  const {
    walletState,
    loading,
    connectWallet,
    disconnectWallet,
  } = useContractContext();

  const navItems = [
    { path: '/', label: 'Trang chủ', icon: Home },
    { path: '/search', label: 'Tra cứu', icon: Search },
    { path: '/products', label: 'Sản phẩm', icon: List },
    { path: '/admin', label: 'Quản lý', icon: Settings },
  ];

  return (
    <header className="bg-white shadow-lg border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">
              Traceability
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Medium screen navigation - icons only */}
          <nav className="hidden md:flex lg:hidden items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {walletState.isConnected && <NetworkInfo />}
            <WalletConnection
              walletState={walletState}
              onConnect={connectWallet}
              onDisconnect={disconnectWallet}
              loading={loading}
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-100">
          <nav className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};