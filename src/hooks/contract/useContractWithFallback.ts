import { useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../constants/contract';
import { useEnhancedProvider } from './useEnhancedProvider';

export const useContractWithFallback = () => {
  const { provider, signer, isConnected, connectionType, getReadOnlyProvider } = useEnhancedProvider();

  const getContract = useCallback(async (needsSigner: boolean = false) => {
    if (needsSigner && !signer) {
      throw new Error('Cần MetaMask để thực hiện giao dịch này');
    }

    if (needsSigner && signer) {
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }

    // Cho read operations, ưu tiên provider hiện tại
    if (provider) {
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    }

    // Fallback to read-only provider
    const readOnlyProvider = await getReadOnlyProvider();
    if (readOnlyProvider) {
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, readOnlyProvider);
    }

    throw new Error('Không thể kết nối tới contract');
  }, [provider, signer, getReadOnlyProvider]);

  const executeContractCall = useCallback(async <T>(
    contractCall: (contract: ethers.Contract) => Promise<T>,
    needsSigner: boolean = false,
    retries: number = 3
  ): Promise<T> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const contract = await getContract(needsSigner);
        return await contractCall(contract);
      } catch (error: any) {
        lastError = error;
        console.warn(`Contract call attempt ${attempt + 1} failed:`, error);
        
        // Nếu là lỗi user reject, không retry
        if (error.message?.includes('user rejected')) {
          throw error;
        }
        
        // Chờ một chút trước khi retry
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error('Contract call failed after retries');
  }, [getContract]);

  return {
    isConnected,
    connectionType,
    executeContractCall,
    getContract,
  };
};