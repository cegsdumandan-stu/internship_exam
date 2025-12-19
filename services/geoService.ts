import { GeoData } from '../types';

export const fetchGeoLocation = async (ip?: string): Promise<GeoData | null> => {
  try {
    // If an IP is provided, use it; otherwise default to the current user's location via /geo
    const url = ip ? `https://ipinfo.io/${ip}/geo` : 'https://ipinfo.io/geo';
    
    const response = await fetch(url);
    
    if (!response.ok) {
        // Attempt to parse error message if available, or throw generic
        throw new Error('Failed to fetch location data');
    }
    
    const data: GeoData = await response.json();
    
    // Check if basic fields exist to ensure validity
    if (!data.ip && !data.city) {
         throw new Error('Invalid location data received');
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching geo location:", error);
    return null;
  }
};