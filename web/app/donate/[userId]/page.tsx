'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { useRouter, useParams } from 'next/navigation';
import { apiService, UserProfile } from '@/lib/services/api';
import { blockchainService } from '@/lib/services/blockchain';
import { parseEther, parseUnits } from 'viem';
import Link from 'next/link';

export default function DonatePage() {
  const router = useRouter();
  const params = useParams();
  const { address, isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const [recipient, setRecipient] = useState<UserProfile | null>(null);
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState<'ETH' | 'USDC'>('ETH');
  const [donationType, setDonationType] = useState<'crypto' | 'fiat'>('crypto');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected) {
      router.push('/register');
      return;
    }
    loadRecipient();
  }, [params.userId, isConnected]);

  const loadRecipient = async () => {
    try {
      const userId = params.userId as string;
      const recipientData = await apiService.getUserProfile(userId);
      setRecipient(recipientData);
    } catch (error) {
      console.error('Error loading recipient:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoDonation = async () => {
    if (!recipient || !amount || !address) {
      setError('Please enter an amount');
      return;
    }

    try {
      setError(null);
      // This would use wagmi's writeContract hook
      // For now, showing a placeholder
      alert('Crypto donation feature - integrate with wagmi writeContract');
    } catch (err: any) {
      setError(err.message || 'Donation failed');
    }
  };

  const handleFiatDonation = async () => {
    if (!recipient || !amount) {
      setError('Please enter an amount');
      return;
    }

    try {
      setError(null);
      const response = await apiService.createFiatDonation({
        recipientId: recipient.userId,
        amount: parseFloat(amount),
        currency: 'fiat',
      });

      // Redirect to Stripe Checkout
      // In production, use Stripe's redirect
      alert('Redirecting to Stripe Checkout...');
    } catch (err: any) {
      setError(err.message || 'Donation failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!recipient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Recipient not found</p>
          <Link href="/" className="text-purple-600 hover:text-purple-700">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Make a Donation</h1>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Recipient:</p>
          <p className="font-semibold">
            {recipient.walletAddress.slice(0, 6)}...{recipient.walletAddress.slice(-4)}
          </p>
          {recipient.zoneType && (
            <p className="text-sm text-gray-600 mt-1">
              {recipient.zoneType === 'disaster' ? '🌍 Disaster Zone' : '⚔️ War Zone'}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Donation Type
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => setDonationType('crypto')}
              className={`flex-1 px-4 py-2 rounded-lg ${
                donationType === 'crypto'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Cryptocurrency
            </button>
            <button
              onClick={() => setDonationType('fiat')}
              className={`flex-1 px-4 py-2 rounded-lg ${
                donationType === 'fiat'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Credit Card
            </button>
          </div>
        </div>

        {donationType === 'crypto' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token
            </label>
            <select
              value={token}
              onChange={(e) => setToken(e.target.value as 'ETH' | 'USDC')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount {donationType === 'crypto' ? `(${token})` : '(USD)'}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={donationType === 'crypto' ? handleCryptoDonation : handleFiatDonation}
          disabled={isPending || !amount}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {isPending ? 'Processing...' : 'Donate'}
        </button>

        <Link
          href="/"
          className="block text-center text-purple-600 hover:text-purple-700"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}

