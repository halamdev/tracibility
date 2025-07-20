import React, { createContext, useContext, ReactNode } from 'react';
import { useContract } from '../hooks/useContract';
import { WalletState, Product, Step } from '../types/contract';

interface ContractContextType {
  walletState: WalletState;
  loading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  createProduct: (productId: string, name: string, ipfsHash: string, location: string, status: number) => Promise<any>;
  addStep: (productId: string, location: string, description: string, status: number) => Promise<any>;
  getProduct: (productId: string) => Promise<Product | null>;
  getSteps: (productId: string) => Promise<Step[]>;
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
  const contractHook = useContract();

  return (
    <ContractContext.Provider value={contractHook}>
      {children}
    </ContractContext.Provider>
  );
};