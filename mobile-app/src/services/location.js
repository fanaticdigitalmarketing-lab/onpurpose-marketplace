import * as Location from 'expo-location';
import { Alert } from 'react-native';

class LocationService {
  constructor() {
    this.currentLocation = null;
    this.watchId = null;
  }

  async requestPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'OnPurpose needs location access to show nearby hosts and provide better recommendations.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });

      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      return this.currentLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      
      // Fallback to NYC center if location fails
      this.currentLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      
      return this.currentLocation;
    }
  }

  async reverseGeocode(latitude, longitude) {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result.length > 0) {
        const address = result[0];
        return {
          neighborhood: address.district || address.subregion,
          city: address.city,
          region: address.region,
          formattedAddress: `${address.district || address.subregion}, ${address.city}`,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  async geocodeAddress(address) {
    try {
      const result = await Location.geocodeAsync(address);
      
      if (result.length > 0) {
        return {
          latitude: result[0].latitude,
          longitude: result[0].longitude,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  async findNearbyHosts(hosts, radiusMiles = 10) {
    try {
      const currentLocation = await this.getCurrentLocation();
      if (!currentLocation) return hosts;

      const hostsWithDistance = hosts.map(host => {
        if (host.latitude && host.longitude) {
          const distance = this.calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            host.latitude,
            host.longitude
          );
          
          return {
            ...host,
            distance,
            isNearby: distance <= radiusMiles,
          };
        }
        
        return { ...host, distance: null, isNearby: false };
      });

      // Sort by distance (nearby hosts first)
      return hostsWithDistance.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    } catch (error) {
      console.error('Error finding nearby hosts:', error);
      return hosts;
    }
  }

  startLocationTracking(callback) {
    this.requestPermissions().then(hasPermission => {
      if (hasPermission) {
        this.watchId = Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 30000, // Update every 30 seconds
            distanceInterval: 100, // Update every 100 meters
          },
          callback
        );
      }
    });
  }

  stopLocationTracking() {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  getNYCNeighborhoods() {
    return [
      // Manhattan
      { name: 'Upper East Side', borough: 'Manhattan' },
      { name: 'Upper West Side', borough: 'Manhattan' },
      { name: 'Midtown', borough: 'Manhattan' },
      { name: 'Chelsea', borough: 'Manhattan' },
      { name: 'Greenwich Village', borough: 'Manhattan' },
      { name: 'SoHo', borough: 'Manhattan' },
      { name: 'Lower East Side', borough: 'Manhattan' },
      { name: 'Financial District', borough: 'Manhattan' },
      { name: 'Tribeca', borough: 'Manhattan' },
      { name: 'Harlem', borough: 'Manhattan' },
      
      // Brooklyn
      { name: 'Williamsburg', borough: 'Brooklyn' },
      { name: 'DUMBO', borough: 'Brooklyn' },
      { name: 'Park Slope', borough: 'Brooklyn' },
      { name: 'Brooklyn Heights', borough: 'Brooklyn' },
      { name: 'Bushwick', borough: 'Brooklyn' },
      { name: 'Red Hook', borough: 'Brooklyn' },
      { name: 'Coney Island', borough: 'Brooklyn' },
      
      // Queens
      { name: 'Long Island City', borough: 'Queens' },
      { name: 'Astoria', borough: 'Queens' },
      { name: 'Flushing', borough: 'Queens' },
      { name: 'Jackson Heights', borough: 'Queens' },
      
      // Bronx
      { name: 'South Bronx', borough: 'Bronx' },
      { name: 'Fordham', borough: 'Bronx' },
      
      // Staten Island
      { name: 'St. George', borough: 'Staten Island' },
    ];
  }

  getLocation() {
    return this.currentLocation;
  }
}

export default new LocationService();
