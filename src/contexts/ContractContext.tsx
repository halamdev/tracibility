import React, { createContext, useContext, ReactNode } from 'react';
import { useState, useMemo } from 'react';
import {
  useConnectWallet,
  useDisconnectWallet,
  useCreateProduct,
  useAddStep,
  useGetProduct,
  useGetSteps,
  useGetProductsByCreator,
  useAuthorizeUser,
  useRevokeUser
} from '../hooks/contract';
import { WalletState, Product, Step } from '../types/contract';

interface ContractContextType {
  walletState: WalletState;
  loading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  createProduct: (productId: string, name: string, ipfsHash: string, location: string) => Promise<any>;
  addStep: (productId: string, location: string, description: string, stepStatus: number) => Promise<any>;
  getProduct: (productId: string) => Promise<Product | null>;
  getSteps: (productId: string) => Promise<Step[]>;
  getProductsByCreator: (creatorAddress: string) => Promise<string[]>;
  authorizeUser: (address: string) => Promise<any>;
  revokeUser: (address: string) => Promise<any>;
  clearError: () => void;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export const useContractContext = () => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContractContext must be used within a ContractProvider');
  }
  return context;
};

interface ContractProviderProps {
  children: ReactNode;
}

export const ContractProvider: React.FC<ContractProviderProps> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null as string | null,
    isConnected: false,
    isAuthorized: false,
    isOwner: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug contract function (inline, only for connectWallet)
  const debugContract = async () => {
    if (!window.ethereum) return false;
    try {
      const { ethers } = await import('ethers');
      const { CONTRACT_ADDRESS, CONTRACT_ABI } = await import('../constants/contract');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (code === '0x') return false;
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      try {
        await contract.owner();
        return true;
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  };

  const connectWallet = useConnectWallet(setWalletState, setLoading, setError, debugContract);
  const disconnectWallet = useDisconnectWallet(setWalletState);
  const createProduct = useCreateProduct(walletState, setLoading, setError);
  const addStep = useAddStep(walletState, setLoading, setError);
  const getProduct = useGetProduct(setError);
  const getSteps = useGetSteps(setError);
  const getProductsByCreator = useGetProductsByCreator(setError);
  const authorizeUser = useAuthorizeUser(walletState, setLoading, setError);
  const revokeUser = useRevokeUser(walletState, setLoading, setError);

  const clearError = () => setError(null);

  const contextValue = useMemo(() => ({
    walletState,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    createProduct,
    addStep,
    getProduct,
    getSteps,
    getProductsByCreator,
    authorizeUser,
    revokeUser,
    clearError,
  }), [walletState, loading, error, connectWallet, disconnectWallet, createProduct, addStep, getProduct, getSteps, getProductsByCreator, authorizeUser, revokeUser]);

  return (
    <ContractContext.Provider value={contextValue}>
      {children}
    </ContractContext.Provider>
  );
};