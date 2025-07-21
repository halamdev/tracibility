import { useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../constants/contract';

export const useGetProductsByCreator = (setError: (e: string | null) => void) => {
  return useCallback(async (creatorAddress: string): Promise<string[]> => {
    try {
      setError(null);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const productIds = await contract.getProductsByCreator(creatorAddress);
      return productIds;
    } catch (err: any) {
      const errorMessage = err.message || 'Lỗi lấy danh sách sản phẩm';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [setError]);
};
