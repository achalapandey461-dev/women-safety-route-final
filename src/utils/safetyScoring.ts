import type { SafetyFactors, Route, Location } from '../types';

// Jaipur demo coordinates
export const JAIPUR_LOCATIONS: Record<string, Location> = {
  'Vaishali Nagar, Jaipur': { lat: 26.8914, lng: 75.7825, address: 'Vaishali Nagar, Jaipur' },
  'Rajasthan College of Engineering for Women, Jaipur': { lat: 26.8515, lng: 75.8215, address: 'Rajasthan College of Engineering for Women, Jaipur' },
  'MI Road, Jaipur': { lat: 26.9150, lng: 75.8100, address: 'MI Road, Jaipur' },
  'Johari Bazaar, Jaipur': { lat: 26.9240, lng: 75.8250, address: 'Johari Bazaar, Jaipur' },
  'C-Scheme, Jaipur': { lat: 26.9020, lng: 75.7930, address: 'C-Scheme, Jaipur' },
  'Mansarovar, Jaipur': { lat: 26.8600, lng: 75.7700, address: 'Mansarovar, Jaipur' },
  'Raja Park, Jaipur': { lat: 26.8700, lng: 75.8300, address: 'Raja Park, Jaipur' },
  'Civil Lines, Jaipur': { lat: 26.9200, lng: 75.8000, address: 'Civil Lines, Jaipur' },
};

export function calculateSafetyScore(factors: SafetyFactors, isNightMode: boolean): number {
  let score = 100;

  // Deduct for crime risk
  score -= factors.crimeRisk * 0.3;

  // Deduct more for poor lighting at night
  if (isNightMode) {
    score -= factors.poorLighting * 0.25;
  } else {
    score -= factors.poorLighting * 0.1;
  }

  // Deduct for accident rate
  score -= factors.accidentRate * 0.15;

  // Deduct for hazard reports
  score -= factors.hazardReports * 5;

  // Add bonus for safety features
  if (factors.policeStationNearby) score += 10;
  if (factors.hospitalNearby) score += 5;
  if (factors.busyRoad) score += isNightMode ? 5 : 10;

  return Math.min(100, Math.max(0, Math.round(score)));
}

export function getSafetyColor(score: number): string {
  if (score >= 70) return '#10b981'; // green
  if (score >= 40) return '#f59e0b'; // yellow/amber
  return '#ef4444'; // red
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export interface DemoSafetyPoint {
  id: string;
  type: 'police' | 'hospital' | 'crime_hotspot' | 'accident_zone' | 'hazard';
  name: string;
  location: Location;
  severity: number;
}

// Generate demo safety points around Jaipur
export function generateDemoSafetyPoints(): DemoSafetyPoint[] {
  return [
    // Police Stations
    { id: 'police-1', type: 'police', name: 'Vaishali Nagar Police Station', location: { lat: 26.8920, lng: 75.7830, address: 'Vaishali Nagar Police Station' }, severity: 0 },
    { id: 'police-2', type: 'police', name: 'Mansarovar Police Station', location: { lat: 26.8610, lng: 75.7710, address: 'Mansarovar Police Station' }, severity: 0 },
    { id: 'police-3', type: 'police', name: 'C-Scheme Police Station', location: { lat: 26.9030, lng: 75.7940, address: 'C-Scheme Police Station' }, severity: 0 },

    // Hospitals
    { id: 'hospital-1', type: 'hospital', name: 'Fortis Hospital', location: { lat: 26.8950, lng: 75.8000, address: 'Fortis Hospital, Jaipur' }, severity: 0 },
    { id: 'hospital-2', type: 'hospital', name: 'SMS Hospital', location: { lat: 26.9100, lng: 75.7950, address: 'SMS Hospital, Jaipur' }, severity: 0 },

    // Crime Hotspots
    { id: 'crime-1', type: 'crime_hotspot', name: 'High Crime Zone - Industrial Area', location: { lat: 26.8700, lng: 75.7600, address: 'Industrial Area' }, severity: 70 },
    { id: 'crime-2', type: 'crime_hotspot', name: 'Reported Incidents Area', location: { lat: 26.8800, lng: 75.8100, address: 'Reported Incidents Area' }, severity: 50 },

    // Accident Zones
    { id: 'accident-1', type: 'accident_zone', name: 'High Accident Zone', location: { lat: 26.8850, lng: 75.7850, address: 'Accident Prone Area' }, severity: 60 },
    { id: 'accident-2', type: 'accident_zone', name: 'Frequent Accidents', location: { lat: 26.9100, lng: 75.8150, address: 'Frequent Accidents Area' }, severity: 45 },

    // Hazards
    { id: 'hazard-1', type: 'hazard', name: 'Road Construction', location: { lat: 26.8750, lng: 75.7900, address: 'Road Construction Zone' }, severity: 30 },
    { id: 'hazard-2', type: 'hazard', name: 'Poor Lighting Area', location: { lat: 26.8650, lng: 75.7750, address: 'Poor Lighting Area' }, severity: 40 },
  ];
}

// Generate demo routes between two locations
export function generateDemoRoutes(origin: Location, destination: Location, isNightMode: boolean): Route[] {
  const baseDistance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);

  const routes: Route[] = [
    {
      id: 'route-1',
      name: 'Safest Route',
      distance: Math.round(baseDistance * 1.2 * 1000), // slightly longer
      duration: Math.round(baseDistance * 1.2 * 120 + 300), // ~2 minutes per km
      safetyScore: 0,
      safetyFactors: {
        crimeRisk: 15,
        poorLighting: 10,
        accidentRate: 12,
        hazardReports: 1,
        policeStationNearby: true,
        hospitalNearby: true,
        busyRoad: true,
      },
      warnings: [],
      waypoints: [origin, destination],
    },
    {
      id: 'route-2',
      name: 'Balanced Route',
      distance: Math.round(baseDistance * 1.05 * 1000),
      duration: Math.round(baseDistance * 1.05 * 120 + 180),
      safetyScore: 0,
      safetyFactors: {
        crimeRisk: 35,
        poorLighting: 40,
        accidentRate: 30,
        hazardReports: 2,
        policeStationNearby: true,
        hospitalNearby: false,
        busyRoad: true,
      },
      warnings: [],
      waypoints: [origin, destination],
    },
    {
      id: 'route-3',
      name: 'Fastest Route',
      distance: Math.round(baseDistance * 1000),
      duration: Math.round(baseDistance * 120),
      safetyScore: 0,
      safetyFactors: {
        crimeRisk: 55,
        poorLighting: 65,
        accidentRate: 45,
        hazardReports: 4,
        policeStationNearby: false,
        hospitalNearby: false,
        busyRoad: false,
      },
      warnings: [],
      waypoints: [origin, destination],
    },
  ];

  // Calculate safety scores
  routes.forEach(route => {
    route.safetyScore = calculateSafetyScore(route.safetyFactors, isNightMode);

    // Add warnings based on factors
    if (route.safetyFactors.crimeRisk > 30) {
      route.warnings.push({
        type: 'crime',
        severity: route.safetyFactors.crimeRisk > 50 ? 'high' : 'medium',
        message: 'Route passes through high crime area',
        location: route.waypoints[Math.floor(route.waypoints.length / 2)],
      });
    }
    if (route.safetyFactors.poorLighting > 40 && isNightMode) {
      route.warnings.push({
        type: 'lighting',
        severity: 'medium',
        message: 'Poor street lighting on sections of this route',
        location: route.waypoints[1],
      });
    }
  });

  // Sort by safety score (highest first)
  return routes.sort((a, b) => b.safetyScore - a.safetyScore);
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generateWaypoints(origin: Location, destination: Location, offsetFactor: number): Location[] {
  const midLat = (origin.lat + destination.lat) / 2;
  const midLng = (origin.lng + destination.lng) / 2;

  return [
    origin,
    {
      lat: midLat + (Math.random() - 0.5) * offsetFactor,
      lng: midLng + (Math.random() - 0.5) * offsetFactor,
      address: 'Waypoint'
    },
    destination,
  ];
}
