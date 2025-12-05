'use client';

import Link from 'next/link';

interface ZoneFact {
  name: string;
  type: 'war' | 'disaster';
  startDate: string;
  worsenedDate: string;
  childrenLost: string;
  totalLivesLost: string;
  aidUsage: string[];
  coordinates: [number, number];
}

const zoneFacts: ZoneFact[] = [
  {
    name: 'Gaza Strip',
    type: 'war',
    startDate: '1948',
    worsenedDate: 'October 2023 - Present',
    childrenLost: 'Over 10,000+ children',
    totalLivesLost: 'Over 30,000+ lives',
    aidUsage: [
      'Medical supplies and emergency healthcare',
      'Food and clean water',
      'Shelter and temporary housing',
      'Essential clothing and blankets',
      'Emergency communication devices',
      'Psychological support services',
    ],
    coordinates: [31.3547, 34.3088],
  },
  {
    name: 'Sudan',
    type: 'war',
    startDate: 'April 15, 2023',
    worsenedDate: 'April 2023 - Present',
    childrenLost: 'Thousands of children',
    totalLivesLost: 'Over 12,000+ lives',
    aidUsage: [
      'Food and nutrition assistance',
      'Medical care and medicines',
      'Safe drinking water',
      'Shelter for displaced families',
      'Education support for children',
      'Protection services',
    ],
    coordinates: [15.5007, 32.5599],
  },
  {
    name: 'Syria',
    type: 'war',
    startDate: 'March 2011',
    worsenedDate: '2012-2016 (peak conflict)',
    childrenLost: 'Over 27,000+ children',
    totalLivesLost: 'Over 500,000+ lives',
    aidUsage: [
      'Medical treatment and supplies',
      'Food assistance',
      'Water and sanitation',
      'Shelter and housing repairs',
      'Education and school supplies',
      'Winterization assistance',
    ],
    coordinates: [34.8021, 38.9968],
  },
  {
    name: 'Afghanistan',
    type: 'war',
    startDate: '2001',
    worsenedDate: '2021 (Taliban takeover)',
    childrenLost: 'Thousands of children',
    totalLivesLost: 'Over 170,000+ lives',
    aidUsage: [
      'Food and nutrition programs',
      'Healthcare services',
      'Education support',
      'Winter assistance',
      'Emergency shelter',
      'Livelihood support',
    ],
    coordinates: [33.9391, 67.7100],
  },
  {
    name: 'Kashmir',
    type: 'war',
    startDate: '1947',
    worsenedDate: '2019 (heightened tensions)',
    childrenLost: 'Hundreds of children',
    totalLivesLost: 'Tens of thousands',
    aidUsage: [
      'Medical care',
      'Food assistance',
      'Education support',
      'Psychosocial support',
      'Emergency shelter',
    ],
    coordinates: [34.0837, 74.7973],
  },
  {
    name: 'Pakistan Flood Areas',
    type: 'disaster',
    startDate: 'June 2022',
    worsenedDate: 'August-September 2022',
    childrenLost: 'Over 500+ children',
    totalLivesLost: 'Over 1,700+ lives',
    aidUsage: [
      'Emergency shelter and tents',
      'Clean water and sanitation',
      'Food and nutrition',
      'Medical care and medicines',
      'Rebuilding homes and infrastructure',
      'Livelihood recovery',
    ],
    coordinates: [30.3753, 69.3451],
  },
];

export default function ZonesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-600">Disaster Relief</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Crisis Zone Information
          </h2>
          <p className="text-xl text-gray-600">
            Learn about the humanitarian crises and how your donations help
          </p>
        </div>

        <div className="space-y-8">
          {zoneFacts.map((zone, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {zone.name}
                  </h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      zone.type === 'war'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {zone.type === 'war' ? '⚔️ War Zone' : '🌍 Disaster Zone'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Timeline
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Worsened:
                      </p>
                      <p className="text-base text-gray-900">{zone.worsenedDate}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Human Cost
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Children Lost:
                      </p>
                      <p className="text-base font-semibold text-red-600">
                        {zone.childrenLost}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Lives Lost:
                      </p>
                      <p className="text-base font-semibold text-red-600">
                        {zone.totalLivesLost}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  How Your Donations Help
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Your financial aid directly supports:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {zone.aidUsage.map((usage, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <span className="text-purple-600 mt-1">✓</span>
                      <span>{usage}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}

