import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../constants/contract';
import { ProductStatus, WalletState } from '../../types/contract';

export const useCreateProduct = (walletState: WalletState, setLoading: (b: boolean) => void, setError: (e: string | null) => void) => {
  return useCallback(async (productId: string, name: string, ipfsHash: string, location: string) => {
    if (!walletState.isConnected || !walletState.isAuthorized) {
      toast.error('Bạn không có quyền tạo sản phẩm');
      throw new Error('Bạn không có quyền tạo sản phẩm');
    }
    try {
      setLoading(true);
      setError(null);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      try {
        const exists = await contract.isProductExists(productId);
        if (exists) throw new Error('Sản phẩm với mã này đã tồn tại');
      } catch (checkError: any) {
        if (!checkError.message.includes('đã tồn tại')) {
          console.warn('Không thể kiểm tra sản phẩm tồn tại:', checkError);
        } else {
          throw checkError;
        }
      }
      const tx = await contract.createProduct(productId, name, ipfsHash, location, ProductStatus.Created);
      await tx.wait();
      return tx;
    } catch (err: any) {
      let errorMessage = 'Lỗi tạo sản phẩm';
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
