import React, { useState, useEffect } from 'react';
import { Globe, AlertTriangle } from 'lucide-react';
import { ethers } from 'ethers';

export const NetworkInfo: React.FC = () => {
  const [networkInfo, setNetworkInfo] = useState<{
    name: string;
    chainId: number;
    isSupported: boolean;
  } | null>(null);

  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          
          // Danh sách các network được hỗ trợ - thêm nhiều testnet
          const supportedNetworks = [
            1,        // Mainnet
            11155111, // Sepolia
            5,        // Goerli (deprecated but still used)
            1337,     // Localhost
            31337,    // Hardhat
            80001,    // Mumbai (Polygon testnet)
            97,       // BSC testnet
          ];
          
          let networkName = network.name;
          if (networkName === 'unknown') {
            // Map common chain IDs to names
            const chainNames: Record<number, string> = {
              1: 'Ethereum Mainnet',
              11155111: 'Sepolia Testnet',
              5: 'Goerli Testnet',
              1337: 'Localhost',
              31337: 'Hardhat Network',
              80001: 'Mumbai Testnet',
              97: 'BSC Testnet',
            };
            networkName = chainNames[Number(network.chainId)] || `Chain ${network.chainId}`;
          }
          
          setNetworkInfo({
            name: networkName,
            chainId: Number(network.chainId),
            isSupported: supportedNetworks.includes(Number(network.chainId)),
          });
        } catch (error) {
          console.error('Lỗi kiểm tra network:', error);
        }
      }
    };

    checkNetwork();

    if (window.ethereum) {
      window.ethereum.on('chainChanged', checkNetwork);
      return () => {
        window.ethereum.removeListener('chainChanged', checkNetwork);
      };
    }
  }, []);

  if (!networkInfo) return null;

  return (
    <div className={`hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
      networkInfo.isSupported 
        ? 'bg-green-50 text-green-800 border border-green-200'
        : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
    }`}>
      {networkInfo.isSupported ? (
        <Globe className="w-4 h-4" />
      ) : (
        <AlertTriangle className="w-4 h-4" />
      )}
      <span>
        {networkInfo.name}
      </span>
      {!networkInfo.isSupported && (
        <span className="text-xs">- Không hỗ trợ</span>
      )}
    </div>
  );
};