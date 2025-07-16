export interface Step {
  location: string;
  description: string;
  timestamp: bigint;
  actor: string;
}

export interface Product {
  name: string;
  ipfsHash: string;
  creator: string;
  stepCount: bigint;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isAuthorized: boolean;
  isOwner: boolean;
}

export interface ContractError {
  message: string;
  code?: string;
}