const axios = require('axios');

/**
 * Check if a location is in a disaster or war zone
 * Uses multiple data sources for verification
 */
class VerificationService {
  constructor() {
    // Known disaster/war zones (in production, this would come from APIs like ReliefWeb, GDACS, etc.)
    this.disasterZones = [
      // Example zones (replace with real data sources)
      { lat: 33.8869, lon: 35.5131, radius: 50000, type: 'war', name: 'Lebanon Conflict Zone' },
      { lat: 31.9522, lon: 35.2332, radius: 30000, type: 'war', name: 'Palestinian Territories' },
      { lat: 36.1911, lon: 37.1612, radius: 100000, type: 'war', name: 'Syria Conflict Zone' },
      { lat: 50.0647, lon: 19.9450, radius: 20000, type: 'disaster', name: 'Example Disaster Zone' },
    ];
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  toRad(degrees) {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Verify if location is in a disaster/war zone
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Object} Verification result
   */
  async verifyLocation(latitude, longitude) {
    try {
      // Check against known zones
      for (const zone of this.disasterZones) {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          zone.lat,
          zone.lon
        );

        // If within zone radius (convert km to meters for comparison)
        if (distance * 1000 <= zone.radius) {
          return {
            verified: true,
            zoneType: zone.type,
            zoneName: zone.name,
            requiresReview: false,
            message: `Verified in ${zone.name}`,
          };
        }
      }

      // If not found in known zones, check external APIs
      // In production, integrate with ReliefWeb API, GDACS, etc.
      const externalVerification = await this.checkExternalSources(
        latitude,
        longitude
      );

      if (externalVerification.verified) {
        return externalVerification;
      }

      // If not automatically verified, require manual review
      return {
        verified: false,
        requiresReview: true,
        message:
          'Location not found in known disaster/war zones. Your request will be reviewed manually.',
      };
    } catch (error) {
      console.error('Verification error:', error);
      return {
        verified: false,
        requiresReview: true,
        message: 'Verification service error. Your request will be reviewed manually.',
      };
    }
  }

  /**
   * Check external disaster/war zone data sources
   * In production, integrate with:
   * - ReliefWeb API: https://api.reliefweb.int/
   * - GDACS API: https://www.gdacs.org/xml/rss.xml
   * - Other disaster monitoring services
   */
  async checkExternalSources(latitude, longitude) {
    // Placeholder for external API integration
    // Example: ReliefWeb API integration
    try {
      // This is a placeholder - implement actual API calls
      // const response = await axios.get('https://api.reliefweb.int/v1/disasters', {
      //   params: {
      //     'filter[field]': 'location',
      //     'filter[value]': `${latitude},${longitude}`,
      //   },
      // });

      // For now, return false to trigger manual review
      return {
        verified: false,
        requiresReview: true,
      };
    } catch (error) {
      console.error('External verification error:', error);
      return {
        verified: false,
        requiresReview: true,
      };
    }
  }
}

module.exports = new VerificationService();

