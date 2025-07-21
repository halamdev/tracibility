import React from 'react';
import { Wallet, LogOut, Shield, Crown } from 'lucide-react';
import { WalletState } from '../types/contract';

interface WalletConnectionProps {
  walletState: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
  loading: boolean;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({
  walletState,
  onConnect,
  onDisconnect,
  loading,
}) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!walletState.isConnected) {
    return (
      <div className="text-center">
        <button
          onClick={onConnect}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          <Wallet className="w-5 h-5" />
          <span className="hidden sm:inline">{loading ? 'Đang kết nối...' : 'Kết nối ví'}</span>
          <span className="sm:hidden">{loading ? 'Kết nối...' : 'Kết nối'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2 bg-green-50 text-green-800 px-2 sm:px-4 py-2 rounded-lg border border-green-200">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="font-mono text-xs sm:text-sm">{formatAddress(walletState.address!)}</span>
        {walletState.isOwner && (
          <span title="Chủ hợp đồng">
            <Crown className="w-4 h-4 text-yellow-600" />
          </span>
        )}
        {walletState.isAuthorized && (
          <span title="Có quyền truy cập">
            <Shield className="w-4 h-4 text-green-600" />
          </span>
        )}
        {!walletState.isAuthorized && !walletState.isOwner && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            Chưa có quyền
          </span>
        )}
      </div>
      <button
        onClick={onDisconnect}
        className="flex items-center space-x-1 sm:space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Ngắt kết nối</span>
      </button>
    </div>
  );
};