'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useLocation } from '@/lib/hooks/useLocation';
import { apiService } from '@/lib/services/api';
import Link from 'next/link';

export default function VerifyPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { getCurrentLocation, hasPermission, requestPermission, loading: locationLoading } = useLocation();
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed' | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isConnected) {
      router.push('/register');
    }
  }, [isConnected, router]);

  const handleVerify = async () => {
    if (!address) {
      return;
    }

    try {
      setVerifying(true);

      // Request permission if needed
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          setMessage('Location permission is required to verify you are in a disaster or war zone.');
          return;
        }
      }

      // Get current location
      const location = await getCurrentLocation();

      // Get user ID
      const userId = localStorage.getItem('userId');
      if (!userId) {
        router.push('/register');
        return;
      }

      // Verify location with backend
      const response = await apiService.verifyLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        userId: userId,
      });

      setMessage(response.message);

      if (response.verified) {
        setVerificationStatus('verified');
        setTimeout(() => {
          router.push('/profile');
        }, 2000);
      } else if (response.requiresReview) {
        setVerificationStatus('pending');
        setTimeout(() => {
          router.push('/profile');
        }, 3000);
      } else {
        setVerificationStatus('failed');
      }
    } catch (error: any) {
      setVerificationStatus('failed');
      setMessage(error.message || 'Failed to verify location');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Location Verification</h1>
        <p className="text-center text-gray-600 mb-8">
          Verify that you are in a disaster or war zone to receive donations
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            🔒 Your exact location will NOT be shared with anyone. We only use it to verify that you are in a recognized disaster or war zone.
          </p>
        </div>

        <div className="text-center mb-6">
          {verificationStatus === 'verified' && (
            <div className="text-green-600 text-xl font-semibold mb-2">
              ✓ Verified
            </div>
          )}
          {verificationStatus === 'pending' && (
            <div className="text-yellow-600 text-xl font-semibold mb-2">
              ⏳ Pending Review
            </div>
          )}
          {verificationStatus === 'failed' && (
            <div className="text-red-600 text-xl font-semibold mb-2">
              ✗ Verification Failed
            </div>
          )}
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            verificationStatus === 'verified' ? 'bg-green-50 text-green-800' :
            verificationStatus === 'failed' ? 'bg-red-50 text-red-800' :
            'bg-yellow-50 text-yellow-800'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={verifying || locationLoading}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {verifying || locationLoading ? 'Verifying...' : 'Verify Location'}
        </button>

        <p className="text-sm text-gray-500 text-center mb-4">
          Note: Verification may take a few moments. If your location cannot be automatically verified, it will be reviewed by our team.
        </p>

        <Link
          href="/profile"
          className="block text-center text-purple-600 hover:text-purple-700"
        >
          Go to Profile
        </Link>
      </div>
    </div>
  );
}

