import { useCallback } from 'react';
import { WalletState } from '../../types/contract';

export const useDisconnectWallet = (setWalletState: (s: WalletState) => void) => {
  return useCallback(() => {
    setWalletState({
      address: null,
      isConnected: false,
      isAuthorized: false,
      isOwner: false,
    });
  }, [setWalletState]);
};
