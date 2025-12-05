'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, UserProfile } from '@/lib/services/api';
import { blockchainService } from '@/lib/services/blockchain';
import { useWeb3 } from '@/lib/hooks/useWeb3';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { account, isConnected, disconnect } = useWeb3();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    if (!isConnected) {
      router.push('/register');
      return;
    }
    loadProfile();
  }, [isConnected, address]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      
      if (!userId || !account) {
        return;
      }

      const userProfile = await apiService.getUserProfile(userId);
      setProfile(userProfile);

      // Load blockchain balance
      try {
        const recipientBalance = await blockchainService.getRecipientBalance(account);
        setBalance(recipientBalance);
      } catch (error) {
        console.error('Error loading balance:', error);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    localStorage.removeItem('userId');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-600">Disaster Relief</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-6">Profile</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wallet Address
              </label>
              <p className="text-sm font-mono text-gray-900 break-all">
                {account}
              </p>
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Status
              </label>
              {profile?.verified ? (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                    ✓ Verified
                  </span>
                  {profile.zoneType && (
                    <p className="text-sm text-gray-600 mt-2">
                      {profile.zoneType === 'disaster' ? '🌍 Disaster Zone' : '⚔️ War Zone'}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full mb-2">
                    Not Verified
                  </span>
                  <Link
                    href="/verify"
                    className="block mt-2 text-purple-600 hover:text-purple-700"
                  >
                    Verify Location →
                  </Link>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Donation Balance
              </label>
              <p className="text-2xl font-bold text-purple-600">
                {parseFloat(balance).toFixed(4)} ETH
              </p>
              {profile?.verified && parseFloat(balance) > 0 && (
                <button
                  onClick={() => alert('Withdrawal feature coming soon')}
                  className="mt-2 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50"
                >
                  Withdraw
                </button>
              )}
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Donations Received
              </label>
              <p className="text-2xl font-bold text-gray-900">
                ${profile?.totalDonationsReceived.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDisconnect}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          Disconnect Wallet
        </button>
      </main>
    </div>
  );
}

