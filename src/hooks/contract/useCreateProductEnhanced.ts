import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { ProductStatus, WalletState } from '../../types/contract';
import { useContractWithFallback } from './useContractWithFallback';

export const useCreateProductEnhanced = (
  walletState: WalletState, 
  setLoading: (b: boolean) => void, 
  setError: (e: string | null) => void
) => {
  const { executeContractCall, connectionType } = useContractWithFallback();

  return useCallback(async (productId: string, name: string, ipfsHash: string, location: string) => {
    if (!walletState.isConnected || !walletState.isAuthorized) {
      toast.error('Bạn không có quyền tạo sản phẩm');
      throw new Error('Bạn không có quyền tạo sản phẩm');
    }

    if (connectionType !== 'metamask') {
      toast.error('Cần MetaMask để tạo sản phẩm');
      throw new Error('Cần MetaMask để tạo sản phẩm');
    }

    try {
      setLoading(true);
      setError(null);

      // Kiểm tra sản phẩm đã tồn tại chưa
      const exists = await executeContractCall(async (contract) => {
        return await contract.isProductExists(productId);
      }, false); // Read operation, không cần signer

      if (exists) {
        throw new Error('Sản phẩm với mã này đã tồn tại');
      }

      // Tạo sản phẩm
      const tx = await executeContractCall(async (contract) => {
        return await contract.createProduct(
          productId, 
          name, 
          ipfsHash, 
          location, 
          ProductStatus.Created
        );
      }, true); // Write operation, cần signer

      await tx.wait();
      return tx;

    } catch (err: any) {
      let errorMessage = 'Lỗi tạo sản phẩm';
      
      if (err.reason) {
        errorMessage = err.reason;
      } else if (err.message) {
        if (err.message.includes('user rejected')) {
          errorMessage = 'Giao dịch bị từ chối bởi người dùng';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Không đủ ETH để thực hiện giao dịch';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [walletState, setLoading, setError, executeContractCall, connectionType]);
};