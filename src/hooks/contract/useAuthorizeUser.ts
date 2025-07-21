import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../constants/contract';
import { WalletState } from '../../types/contract';

export const useAuthorizeUser = (walletState: WalletState, setLoading: (b: boolean) => void, setError: (e: string | null) => void) => {
  return useCallback(async (userAddress: string) => {
    if (!walletState.isOwner) {
      toast.error('Chỉ chủ hợp đồng mới có thể cấp quyền');
      throw new Error('Chỉ chủ hợp đồng mới có thể cấp quyền');
    }
    try {
      setLoading(true);
      setError(null);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.authorize(userAddress);
      await tx.wait();
      return tx;
    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Lỗi cấp quyền';
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [walletState, setLoading, setError]);
};
