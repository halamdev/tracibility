import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants/contract';
import { WalletState, Product, Step, ProductStatus } from '../types/contract';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useContract = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isAuthorized: false,
    isOwner: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug function to check contract
  const debugContract = async () => {
    if (!window.ethereum) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      console.log('Network:', network.name, 'Chain ID:', network.chainId);
      
      const code = await provider.getCode(CONTRACT_ADDRESS);
      console.log('Contract code length:', code.length);
      console.log('Contract exists:', code !== '0x');
      
      if (code === '0x') {
        console.error('Contract not found at address:', CONTRACT_ADDRESS);
        return false;
      }
      
      // Try to call a simple view function
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      try {
        const owner = await contract.owner();
        console.log('Contract owner:', owner);
        return true;
      } catch (callError) {
        console.error('Error calling contract:', callError);
        return false;
      }
    } catch (error) {
      console.error('Debug contract error:', error);
      return false;
    }
  };

  const connectWallet = useCallback(async () => {
  if (!window.ethereum) {
    const msg = "MetaMask không được tìm thấy. Vui lòng cài đặt MetaMask.";
    setError(msg);
    toast.error(msg);
    return;
  }

  try {
    setLoading(true);
    setError(null);

    const contractExists = await debugContract();
    if (!contractExists) {
      const msg =
        "Smart contract không tồn tại tại địa chỉ này hoặc bạn đang ở sai network. Vui lòng kiểm tra lại.";
      setError(msg);
      toast.error(msg);
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (accounts.length > 0) {
      const address = accounts[0];

      // GỌI BACKEND ĐỂ CHECK VÍ HỢP LỆ
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8090/api/users/auth/wallet-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ wallet: address }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        const msg =
          result.error || "Ví của bạn không khớp với tài khoản hiện tại.";
        setError(msg);
        toast.error(msg);
        return;
      }

      // Nếu đúng ví, tiếp tục
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      console.log(
        "Connected to network:",
        network.name,
        "Chain ID:",
        network.chainId
      );

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      let isAuthorized = false;
      let isOwner = false;

      try {
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === "0x") {
          throw new Error("Smart contract không tồn tại tại địa chỉ này");
        }

        const [authResult, ownerResult] = await Promise.allSettled([
          Promise.race([
            contract.isAuthorized(address),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), 10000)
            ),
          ]),
          Promise.race([
            contract.owner(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), 10000)
            ),
          ]),
        ]);

        if (authResult.status === "fulfilled") {
          isAuthorized = authResult.value;
        } else {
          console.warn("Không thể kiểm tra quyền:", authResult.reason);
        }

        if (ownerResult.status === "fulfilled") {
          isOwner =
            address.toLowerCase() === ownerResult.value.toLowerCase();
        } else {
          console.warn("Không thể kiểm tra owner:", ownerResult.reason);
        }
      } catch (contractError: any) {
        console.error("Lỗi khi gọi contract:", contractError);
        const msg = `Lỗi kết nối contract: ${contractError.message}`;
        setError(msg);
        toast.error(msg);
        return;
      }

      setWalletState({
        address,
        isConnected: true,
        isAuthorized,
        isOwner,
      });
    }
  } catch (err: any) {
    console.error("Lỗi kết nối ví:", err);
    const msg = err.message || "Lỗi kết nối ví. Vui lòng thử lại.";
    setError(msg);
    toast.error(msg);
  } finally {
    setLoading(false);
  }
}, []);


  const disconnectWallet = useCallback(() => {
    setWalletState({
      address: null,
      isConnected: false,
      isAuthorized: false,
      isOwner: false,
    });
  }, []);

  const createProduct = useCallback(async (productId: string, name: string, ipfsHash: string, location: string) => {
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

      // Kiểm tra xem sản phẩm đã tồn tại chưa
      try {
        const exists = await contract.isProductExists(productId);
        if (exists) {
          throw new Error('Sản phẩm với mã này đã tồn tại');
        }
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
      console.error('Lỗi tạo sản phẩm:', err);
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
  }, [walletState]);

  const addStep = useCallback(async (productId: string, location: string, description: string, stepStatus: number) => {
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

      // Kiểm tra sản phẩm có tồn tại không
      try {
        const exists = await contract.isProductExists(productId);
        if (!exists) {
          throw new Error('Sản phẩm không tồn tại');
        }
      } catch (checkError: any) {
        if (checkError.message.includes('không tồn tại')) {
          throw checkError;
        }
        console.warn('Không thể kiểm tra sản phẩm:', checkError);
      }

      const tx = await contract.addStep(productId, location, description, stepStatus);
      await tx.wait();

      return tx;
    } catch (err: any) {
      console.error('Lỗi thêm bước:', err);
      let errorMessage = 'Lỗi thêm bước truy xuất';
      
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
  }, [walletState]);

  const getProduct = useCallback(async (productId: string): Promise<Product | null> => {
    try {
      setError(null);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Kiểm tra contract tồn tại
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (code === '0x') {
        throw new Error('Smart contract không tồn tại');
      }

      try {
        const exists = await contract.isProductExists(productId);
        if (!exists) {
      const msg = 'Không tìm thấy sản phẩm với mã này';
      setError(msg);
      toast.error(msg);
          return null;
        }

        const [name, ipfsHash, creator, status, steps, location] = await contract.getProduct(productId);
        return { name, ipfsHash, creator, status, steps, location };
      } catch (contractError: any) {
        console.error('Lỗi gọi contract getProduct:', contractError);
        if (contractError.message.includes('could not decode result data')) {
          throw new Error('Lỗi đọc dữ liệu từ contract. Vui lòng kiểm tra network và thử lại.');
        }
        throw contractError;
      }
    } catch (err: any) {
      console.error('Lỗi getProduct:', err);
      const errorMessage = err.message || 'Lỗi lấy thông tin sản phẩm';
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getSteps = useCallback(async (productId: string): Promise<Step[]> => {
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
        console.error('Lỗi gọi contract getSteps:', contractError);
        if (contractError.message.includes('could not decode result data')) {
          // Trả về mảng rỗng nếu không đọc được dữ liệu
          console.warn('Không thể đọc steps, trả về mảng rỗng');
          return [];
        }
        throw contractError;
      }
    } catch (err: any) {
      console.error('Lỗi getSteps:', err);
      const errorMessage = err.message || 'Lỗi lấy danh sách bước truy xuất';
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getProductsByCreator = useCallback(async (creatorAddress: string): Promise<string[]> => {
    try {
      setError(null);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const productIds = await contract.getProductsByCreator(creatorAddress);
      return productIds;
    } catch (err: any) {
      console.error('Lỗi getProductsByCreator:', err);
      const errorMessage = err.message || 'Lỗi lấy danh sách sản phẩm';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);
  const authorizeUser = useCallback(async (userAddress: string) => {
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
  }, [walletState]);

  const revokeUser = useCallback(async (userAddress: string) => {
    if (!walletState.isOwner) {
      toast.error('Chỉ chủ hợp đồng mới có thể thu hồi quyền');
      throw new Error('Chỉ chủ hợp đồng mới có thể thu hồi quyền');
    }

    try {
      setLoading(true);
      setError(null);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.revoke(userAddress);
      await tx.wait();

      return tx;
    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Lỗi thu hồi quyền';
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [walletState]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [connectWallet, disconnectWallet]);

  return {
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
    clearError: () => setError(null),
  };
};