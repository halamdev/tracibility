import { ethers } from 'ethers';

// Cấu hình các RPC endpoints
const RPC_URLS = {
  mainnet: [
    'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    'https://eth-mainnet.alchemyapi.io/v2/YOUR_ALCHEMY_KEY',
    'https://rpc.ankr.com/eth',
  ],
  sepolia: [
    'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    'https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY',
  ],
  localhost: ['http://localhost:8545'],
};

export class ProviderManager {
  private providers: Map<number, ethers.JsonRpcProvider[]> = new Map();
  private currentProviderIndex: Map<number, number> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Mainnet
    this.providers.set(1, RPC_URLS.mainnet.map(url => new ethers.JsonRpcProvider(url)));
    
    // Sepolia
    this.providers.set(11155111, RPC_URLS.sepolia.map(url => new ethers.JsonRpcProvider(url)));
    
    // Localhost
    this.providers.set(1337, RPC_URLS.localhost.map(url => new ethers.JsonRpcProvider(url)));
  }

  async getProvider(chainId: number): Promise<ethers.JsonRpcProvider | null> {
    const providers = this.providers.get(chainId);
    if (!providers || providers.length === 0) return null;

    const currentIndex = this.currentProviderIndex.get(chainId) || 0;
    
    for (let i = 0; i < providers.length; i++) {
      const providerIndex = (currentIndex + i) % providers.length;
      const provider = providers[providerIndex];
      
      try {
        // Test provider
        await provider.getBlockNumber();
        this.currentProviderIndex.set(chainId, providerIndex);
        return provider;
      } catch (error) {
        console.warn(`Provider ${providerIndex} failed for chain ${chainId}:`, error);
        continue;
      }
    }
    
    return null;
  }

  async getBestProvider(): Promise<ethers.Provider> {
    // Ưu tiên MetaMask nếu có
    if (window.ethereum) {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const network = await browserProvider.getNetwork();
        
        // Kiểm tra MetaMask có hoạt động không
        await browserProvider.getBlockNumber();
        return browserProvider;
      } catch (error) {
        console.warn('MetaMask provider failed, trying fallback:', error);
      }
    }

    // Fallback to RPC providers
    const fallbackProvider = await this.getProvider(1); // Default to mainnet
    if (fallbackProvider) {
      return fallbackProvider;
    }

    throw new Error('Không thể kết nối tới bất kỳ Ethereum node nào');
  }
}

export const providerManager = new ProviderManager();