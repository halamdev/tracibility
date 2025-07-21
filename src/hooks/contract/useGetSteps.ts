import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../constants/contract';
import { Step } from '../../types/contract';

export const useGetSteps = (setError: (e: string | null) => void) => {
  return useCallback(async (productId: string): Promise<Step[]> => {
    try {
      setError(null);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      try {
        const steps = await contract.getSteps(productId);
        return steps.map((step: any) => ({
          location: step.location,
          description: step.description,
          timestamp: step.timestamp,
          actor: step.actor,
          status: step.status,
        }));
      } catch (contractError: any) {
        if (contractError.message.includes('could not decode result data')) {
          return [];
        }
        throw contractError;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Lỗi lấy danh sách bước truy xuất';
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, [setError]);
};
