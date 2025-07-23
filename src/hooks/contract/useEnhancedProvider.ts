import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { providerManager } from '../../utils/providers';

interface ProviderState {
  provider: ethers.Provider | null;
  signer: ethers.Signer | null;
  chainId: number | null;
  isConnected: boolean;
  connectionType: 'metamask' | 'rpc' | null;
}

export const useEnhancedProvider = () => {
  const [providerState, setProviderState] = useState<ProviderState>({
    provider: null,
    signer: null,
    chainId: null,
    isConnected: false,
    connectionType: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectProvider = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const provider = await providerManager.getBestProvider();
      const network = await provider.getNetwork();
      
      let signer: ethers.Signer | null = null;
      let connectionType: 'metamask' | 'rpc' = 'rpc';

      // Nếu là BrowserProvider (MetaMask), lấy signer
      if (provider instanceof ethers.BrowserProvider) {
        try {
          signer = await provider.getSigner();
          connectionType = 'metamask';
        } catch (signerError) {
          console.warn('Không thể lấy signer từ MetaMask:', signerError);
        }
      }

      setProviderState({
        provider,
        signer,
        chainId: Number(network.chainId),
        isConnected: true,
        connectionType,
      });

    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối provider');
      setProviderState({
        provider: null,
        signer: null,
        chainId: null,
        isConnected: false,
        connectionType: null,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (!window.ethereum) {
      throw new Error('MetaMask không khả dụng để chuyển network');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      
      // Reconnect sau khi switch
      await connectProvider();
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        throw new Error('Network không được hỗ trợ trong MetaMask');
      }
      throw switchError;
    }
  }, [connectProvider]);

  const getReadOnlyProvider = useCallback(async (chainId?: number) => {
    const targetChainId = chainId || providerState.chainId || 1;
    return await providerManager.getProvider(targetChainId);
  }, [providerState.chainId]);

  // Auto-connect on mount
  useEffect(() => {
    connectProvider();
  }, [connectProvider]);

  // Listen for account/network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = () => {
        connectProvider();
      };

      const handleChainChanged = () => {
        connectProvider();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [connectProvider]);

  return {
    ...providerState,
    loading,
    error,
    connectProvider,
    switchNetwork,
    getReadOnlyProvider,
  };
};