import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../constants/contract';
import { WalletState } from '../../types/contract';

export const useConnectWallet = (setWalletState: (s: WalletState) => void, setLoading: (b: boolean) => void, setError: (e: string | null) => void, debugContract: () => Promise<boolean>) => {
  return useCallback(async () => {
    if (!window.ethereum) {
      const msg = 'MetaMask không được tìm thấy. Vui lòng cài đặt MetaMask.';
      setError(msg);
      toast.error(msg);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const contractExists = await debugContract();
      if (!contractExists) {
        const msg = 'Smart contract không tồn tại tại địa chỉ này hoặc bạn đang ở sai network. Vui lòng kiểm tra lại.';
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const API_BACKEND = import.meta.env.VITE_API_BACKEND_URL;
      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const address = accounts[0];
        // GỌI BACKEND ĐỂ CHECK VÍ HỢP LỆ
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BACKEND}/api/users/auth/wallet-verify`, {
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
        let isAuthorized = false;
        let isOwner = false;
        try {
          const code = await provider.getCode(CONTRACT_ADDRESS);
          if (code === '0x') throw new Error('Smart contract không tồn tại tại địa chỉ này');
          const [authResult, ownerResult] = await Promise.allSettled([
            Promise.race([
              contract.isAuthorized(address),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
            ]),
            Promise.race([
              contract.owner(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
            ])
          ]);
          if (authResult.status === 'fulfilled') isAuthorized = authResult.value;
          if (ownerResult.status === 'fulfilled') isOwner = address.toLowerCase() === ownerResult.value.toLowerCase();
        } catch (contractError: any) {
          const msg = `Lỗi kết nối contract: ${contractError.message}`;
          setError(msg);
          toast.error(msg);
        }
        setWalletState({ address, isConnected: true, isAuthorized, isOwner });
      }
    } catch (err: any) {
      const msg = err.message || 'Lỗi kết nối ví. Vui lòng thử lại.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [setWalletState, setLoading, setError, debugContract]);
};
