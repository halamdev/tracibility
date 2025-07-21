import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../constants/contract';
import { WalletState } from '../../types/contract';

export const useAddStep = (walletState: WalletState, setLoading: (b: boolean) => void, setError: (e: string | null) => void) => {
  return useCallback(async (productId: string, location: string, description: string, stepStatus: number) => {
    if (!walletState.isConnected || !walletState.isAuthorized) {
      toast.error('Bạn không có quyền thêm bước truy xuất');
      throw new Error('Bạn không có quyền thêm bước truy xuất');
    }
    try {
      setLoading(true);
      setError(null);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      try {
        const exists = await contract.isProductExists(productId);
        if (!exists) throw new Error('Sản phẩm không tồn tại');
      } catch (checkError: any) {
        if (checkError.message.includes('không tồn tại')) throw checkError;
        console.warn('Không thể kiểm tra sản phẩm:', checkError);
      }
      const tx = await contract.addStep(productId, location, description, stepStatus);
      await tx.wait();
      return tx;
    } catch (err: any) {
      let errorMessage = 'Lỗi thêm bước truy xuất';
      if (err.reason) errorMessage = err.reason;
      else if (err.message) {
        if (err.message.includes('user rejected')) errorMessage = 'Giao dịch bị từ chối bởi người dùng';
        else if (err.message.includes('insufficient funds')) errorMessage = 'Không đủ ETH để thực hiện giao dịch';
        else errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [walletState, setLoading, setError]);
};
