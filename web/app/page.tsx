'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiService, UserProfile } from '@/lib/services/api';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const DisasterMap = dynamic(() => import('@/components/DisasterMap'), {
  ssr: false,
});

export default function Home() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [recipients, setRecipients] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    try {
      const data = await apiService.getVerifiedRecipients();
      setRecipients(data);
    } catch (error) {
      console.error('Error loading recipients:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-600">Disaster Relief</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <>
                  <span className="text-sm text-gray-600">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <Link
                    href="/profile"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Profile
                  </Link>
                </>
              ) : (
                <Link
                  href="/register"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Help Those in Need
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Donate to verified recipients in disaster and war zones
          </p>
        </div>

        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-gray-900">
              Active Crisis Zones
            </h3>
            <Link
              href="/zones"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
            >
              View Zone Details →
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                <span className="text-sm text-gray-700">War Zones</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-700">Disaster Areas</span>
              </div>
            </div>
            <DisasterMap />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipients.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No verified recipients found</p>
              </div>
            ) : (
              recipients.map((recipient) => (
                <div
                  key={recipient.userId}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {recipient.walletAddress.slice(0, 6)}...
                        {recipient.walletAddress.slice(-4)}
                      </h3>
                      {recipient.zoneType && (
                        <p className="text-sm text-gray-500 mt-1">
                          {recipient.zoneType === 'disaster' ? '🌍 Disaster Zone' : '⚔️ War Zone'}
                        </p>
                      )}
                    </div>
                    {recipient.verified && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-4">
                    Total Donations: ${recipient.totalDonationsReceived.toFixed(2)}
                  </p>
                  <Link
                    href={`/donate/${recipient.userId}`}
                    className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Donate
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

