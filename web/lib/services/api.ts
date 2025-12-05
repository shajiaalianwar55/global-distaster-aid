import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants/config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add error handling for connection errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn('Backend API not available. Make sure the backend server is running.');
    }
    return Promise.reject(error);
  }
);

export interface RegisterRequest {
  walletAddress: string;
  email?: string;
  name?: string;
}

export interface RegisterResponse {
  userId: string;
  walletAddress: string;
  verified: boolean;
}

export interface LocationVerificationRequest {
  latitude: number;
  longitude: number;
  userId: string;
}

export interface LocationVerificationResponse {
  verified: boolean;
  zoneType?: 'disaster' | 'war';
  requiresReview: boolean;
  message: string;
}

export interface UserProfile {
  userId: string;
  walletAddress: string;
  verified: boolean;
  verificationBadgeTokenId?: number;
  totalDonationsReceived: number;
  zoneType?: 'disaster' | 'war';
}

export interface DonationRequest {
  recipientId: string;
  amount: number;
  currency: 'crypto' | 'fiat';
  token?: 'ETH' | 'USDC';
}

export const apiService = {
  // Authentication
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Location Verification
  async verifyLocation(data: LocationVerificationRequest): Promise<LocationVerificationResponse> {
    const response = await api.post('/verify/location', data);
    return response.data;
  },

  // User Profile
  async getUserProfile(userId: string): Promise<UserProfile> {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Donations
  async createFiatDonation(data: DonationRequest): Promise<{ sessionId: string; clientSecret: string }> {
    const response = await api.post('/donations/fiat', data);
    return response.data;
  },

  async getDonationHistory(userId: string): Promise<any[]> {
    const response = await api.get(`/donations/history/${userId}`);
    return response.data;
  },

  // Verified Recipients
  async getVerifiedRecipients(): Promise<UserProfile[]> {
    const response = await api.get('/recipients/verified');
    return response.data;
  },
};

export default apiService;

