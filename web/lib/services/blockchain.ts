import { ethers } from 'ethers';
import {
  DONATION_CONTRACT_ADDRESS,
  VERIFICATION_BADGE_CONTRACT_ADDRESS,
  USDC_TOKEN_ADDRESS,
  BASE_SEPOLIA_RPC,
} from '@/lib/constants/config';

// ABI for DonationContract
const DONATION_CONTRACT_ABI = [
  "function donateNative(address recipient) external payable",
  "function donateUSDC(address recipient, uint256 amount) external",
  "function withdrawNative(uint256 amount) external",
  "function withdrawUSDC(uint256 amount) external",
  "function getRecipientBalance(address recipient) external view returns (uint256)",
  "function verifiedRecipients(address) external view returns (bool)",
  "function recipientBalances(address) external view returns (uint256)",
  "function totalDonationsReceived(address) external view returns (uint256)",
  "event DonationMade(address indexed donor, address indexed recipient, uint256 amount, bool isNative, uint256 timestamp)",
] as const;

// ABI for VerificationBadge
const VERIFICATION_BADGE_ABI = [
  "function isVerified(address user) external view returns (bool)",
  "function getTokenId(address user) external view returns (uint256)",
  "function getVerificationData(address user) external view returns (tuple(address user, uint256 verifiedAt, string zoneType, bool isActive))",
] as const;

// ABI for ERC20 (USDC)
const ERC20_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)",
] as const;

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private donationContract: ethers.Contract | null = null;
  private badgeContract: ethers.Contract | null = null;
  private usdcContract: ethers.Contract | null = null;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
    this.initializeContracts();
  }

  private initializeContracts() {
    if (DONATION_CONTRACT_ADDRESS) {
      this.donationContract = new ethers.Contract(
        DONATION_CONTRACT_ADDRESS,
        DONATION_CONTRACT_ABI,
        this.provider
      );
    }

    if (VERIFICATION_BADGE_CONTRACT_ADDRESS) {
      this.badgeContract = new ethers.Contract(
        VERIFICATION_BADGE_CONTRACT_ADDRESS,
        VERIFICATION_BADGE_ABI,
        this.provider
      );
    }

    this.usdcContract = new ethers.Contract(
      USDC_TOKEN_ADDRESS,
      ERC20_ABI,
      this.provider
    );
  }

  // Get signer from browser wallet
  private getSigner(signer: ethers.Signer): ethers.Contract {
    if (!this.donationContract) {
      throw new Error('Donation contract not initialized');
    }
    return this.donationContract.connect(signer) as ethers.Contract;
  }

  // Check if recipient is verified
  async isRecipientVerified(address: string): Promise<boolean> {
    if (!this.donationContract) {
      throw new Error('Donation contract not initialized');
    }
    return await this.donationContract.verifiedRecipients(address);
  }

  // Get recipient balance
  async getRecipientBalance(address: string): Promise<string> {
    if (!this.donationContract) {
      throw new Error('Donation contract not initialized');
    }
    const balance = await this.donationContract.recipientBalances(address);
    return ethers.formatEther(balance);
  }

  // Donate native ETH
  async donateNative(
    signer: ethers.Signer,
    recipientAddress: string,
    amount: string
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getSigner(signer);
    const tx = await (contract.donateNative(recipientAddress, {
      value: ethers.parseEther(amount),
    }) as Promise<ethers.ContractTransactionResponse>);
    return tx;
  }

  // Donate USDC
  async donateUSDC(
    signer: ethers.Signer,
    recipientAddress: string,
    amount: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.usdcContract) {
      throw new Error('USDC contract not initialized');
    }

    const usdcWithSigner = this.usdcContract.connect(signer) as ethers.Contract;
    const decimals = await this.usdcContract.decimals();
    const amountInWei = ethers.parseUnits(amount, decimals);

    // First approve the donation contract to spend USDC
    const approveTx = await usdcWithSigner.approve(
      DONATION_CONTRACT_ADDRESS,
      amountInWei
    );
    await approveTx.wait();

    // Then donate
    const contract = this.getSigner(signer);
    const tx = await (contract.donateUSDC(recipientAddress, amountInWei) as Promise<ethers.ContractTransactionResponse>);
    return tx;
  }

  // Withdraw native ETH
  async withdrawNative(
    signer: ethers.Signer,
    amount: string
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = this.getSigner(signer);
    const tx = await (contract.withdrawNative(ethers.parseEther(amount)) as Promise<ethers.ContractTransactionResponse>);
    return tx;
  }

  // Withdraw USDC
  async withdrawUSDC(
    signer: ethers.Signer,
    amount: string
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.usdcContract) {
      throw new Error('USDC contract not initialized');
    }

    const decimals = await this.usdcContract.decimals();
    const contract = this.getSigner(signer);
    const tx = await (contract.withdrawUSDC(ethers.parseUnits(amount, decimals)) as Promise<ethers.ContractTransactionResponse>);
    return tx;
  }

  // Check verification badge
  async checkVerificationBadge(address: string): Promise<{
    verified: boolean;
    tokenId?: number;
    zoneType?: string;
  }> {
    if (!this.badgeContract) {
      throw new Error('Badge contract not initialized');
    }

    const verified = await this.badgeContract.isVerified(address);
    if (!verified) {
      return { verified: false };
    }

    const tokenId = await this.badgeContract.getTokenId(address);
    const data = await this.badgeContract.getVerificationData(address);

    return {
      verified: true,
      tokenId: Number(tokenId),
      zoneType: data.zoneType,
    };
  }

  // Get USDC balance
  async getUSDCBalance(address: string): Promise<string> {
    if (!this.usdcContract) {
      throw new Error('USDC contract not initialized');
    }
    const balance = await this.usdcContract.balanceOf(address);
    const decimals = await this.usdcContract.decimals();
    return ethers.formatUnits(balance, decimals);
  }

  // Get ETH balance
  async getETHBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }
}

export const blockchainService = new BlockchainService();

