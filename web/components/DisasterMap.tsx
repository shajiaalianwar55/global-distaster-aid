'use client';

import { useEffect, useState } from 'react';

interface DisasterZone {
  name: string;
  coordinates: [number, number];
  type: 'war' | 'disaster';
  description: string;
}

const disasterZones: DisasterZone[] = [
  {
    name: 'Gaza Strip',
    coordinates: [31.3547, 34.3088],
    type: 'war',
    description: 'Active conflict zone requiring urgent humanitarian aid',
  },
  {
    name: 'Sudan',
    coordinates: [15.5007, 32.5599],
    type: 'war',
    description: 'Ongoing conflict and displacement crisis',
  },
  {
    name: 'Syria',
    coordinates: [34.8021, 38.9968],
    type: 'war',
    description: 'Long-standing conflict zone with humanitarian needs',
  },
  {
    name: 'Afghanistan',
    coordinates: [33.9391, 67.7100],
    type: 'war',
    description: 'Conflict-affected region requiring support',
  },
  {
    name: 'Kashmir',
    coordinates: [34.0837, 74.7973],
    type: 'war',
    description: 'Conflict-affected region',
  },
  {
    name: 'Pakistan Flood Areas',
    coordinates: [30.3753, 69.3451],
    type: 'disaster',
    description: 'Severe flooding affecting millions of people',
  },
];

export default function DisasterMap() {
  const [MapComponent, setMapComponent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Dynamically import Leaflet only on client side
    const loadMap = async () => {
      try {
        const L = await import('leaflet');
        const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet');
        
        // Fix Leaflet icon issue
        delete (L.default.Icon.Default.prototype as any)._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Import CSS - use require for CSS files
        if (typeof window !== 'undefined') {
          require('leaflet/dist/leaflet.css');
        }

        setMapComponent({ MapContainer, TileLayer, Marker, Popup, L: L.default });
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading map:', error);
        setIsLoading(false);
      }
    };

    loadMap();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg mb-8 bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  if (!MapComponent) {
    return (
      <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg mb-8 bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Map unavailable</div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, L } = MapComponent;

  const createCustomIcon = (type: 'war' | 'disaster') => {
    // Use text symbols instead of emojis to avoid encoding issues
    const symbol = type === 'war' ? '⚔' : '🌍';
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="35" viewBox="0 0 25 35">
      <path fill="${type === 'war' ? '#dc2626' : '#2563eb'}" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 22.5 12.5 22.5s12.5-10 12.5-22.5C25 5.596 19.404 0 12.5 0z"/>
      <text x="12.5" y="18" font-family="Arial" font-size="14" font-weight="bold" fill="white" text-anchor="middle">${symbol}</text>
    </svg>`;
    
    // Use encodeURIComponent instead of btoa to handle Unicode characters properly
    const encodedSvg = encodeURIComponent(svgString);
    
    return L.icon({
      iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodedSvg,
      iconSize: [25, 35],
      iconAnchor: [12.5, 35],
    });
  };

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg mb-8">
      <MapContainer
        center={[25, 50]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        {disasterZones.map((zone, index) => (
          <Marker
            key={index}
            position={zone.coordinates}
            icon={createCustomIcon(zone.type)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-1">{zone.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{zone.description}</p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  zone.type === 'war' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {zone.type === 'war' ? '⚔️ War Zone' : '🌍 Disaster Zone'}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
