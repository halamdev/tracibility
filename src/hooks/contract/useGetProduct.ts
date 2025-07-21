import { useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../constants/contract';
import { Product } from '../../types/contract';

export const useGetProduct = (setError: (e: string | null) => void) => {
  return useCallback(async (productId: string): Promise<Product | null> => {
    try {
      setError(null);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (code === '0x') throw new Error('Smart contract không tồn tại');
      try {
        const exists = await contract.isProductExists(productId);
        if (!exists) {
          // Không hiển thị toast ở đây, để component cha xử lý
          return null;
        }
        const [name, ipfsHash, creator, status, steps, location] = await contract.getProduct(productId);
        return { name, ipfsHash, creator, status, steps, location };
      } catch (contractError: any) {
        if (contractError.message.includes('could not decode result data')) {
          throw new Error('Lỗi đọc dữ liệu từ contract. Vui lòng kiểm tra network và thử lại.');
        }
        throw contractError;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Lỗi lấy thông tin sản phẩm';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [setError]);
};
