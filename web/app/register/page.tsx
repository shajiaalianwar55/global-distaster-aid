'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/services/api';
import Link from 'next/link';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Connectors available:', connectors.map(c => ({ name: c.name, ready: c.ready })));
    if (isConnected && address) {
      checkRegistration();
    }
  }, [isConnected, address, connectors]);

  const checkRegistration = async () => {
    try {
      // Try to register/get user
      const response = await apiService.register({
        walletAddress: address!,
        name: name || undefined,
        email: email || undefined,
      });
      
      // Store userId in localStorage
      localStorage.setItem('userId', response.userId);
      
      // Redirect to verification if not verified
      if (!response.verified) {
        router.push('/verify');
      } else {
        router.push('/profile');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
    }
  };

  const handleConnect = async () => {
    try {
      // Check if window.ethereum exists (MetaMask or other injected wallet)
      if (typeof window !== 'undefined' && !window.ethereum) {
        setError('No Web3 wallet detected. Please install MetaMask from https://metamask.io');
        return;
      }

      if (connectors.length === 0) {
        setError('No wallet connectors available. Please install MetaMask or refresh the page.');
        return;
      }

      // Try to connect with the first available connector
      const connector = connectors.find(c => c.ready) || connectors[0];
      
      if (!connector) {
        setError('No wallet connector available. Please install MetaMask.');
        return;
      }

      console.log('Attempting to connect with:', connector.name);

      connect({ connector }, {
        onError: (error) => {
          console.error('Connection error:', error);
          setError(error.message || 'Failed to connect wallet. Please make sure MetaMask is installed and unlocked.');
        },
        onSuccess: () => {
          console.log('Wallet connected successfully');
          setError(null);
        },
      });
    } catch (err: any) {
      console.error('Connect error:', err);
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const handleRegister = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.register({
        walletAddress: address,
        name: name || undefined,
        email: email || undefined,
      });

      localStorage.setItem('userId', response.userId);
      
      if (!response.verified) {
        router.push('/verify');
      } else {
        router.push('/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Welcome to Disaster Relief</h1>
        <p className="text-center text-gray-600 mb-8">
          Connect your wallet to create an account
        </p>

        {!isConnected ? (
          <div>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {connectors.length === 0 && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                <p className="font-semibold mb-1">No wallet detected</p>
                <p>Please install <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="underline">MetaMask</a> or another Web3 wallet extension.</p>
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={connectors.length === 0 || isConnecting}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? 'Connecting...' : connectors.length === 0 ? 'No Wallet Found' : 'Connect Wallet'}
            </button>

            {connectors.length > 0 && (
              <p className="mt-4 text-sm text-gray-500 text-center">
                Available wallets: {connectors.map(c => c.name).join(', ')}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Connected Wallet:</p>
              <p className="text-sm font-mono text-gray-900 break-all">
                {address}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Create Account'}
            </button>

            <Link
              href="/"
              className="block text-center text-purple-600 hover:text-purple-700"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

