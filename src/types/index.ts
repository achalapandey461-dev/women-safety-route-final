export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface SafetyFactors {
  crimeRisk: number;
  poorLighting: number;
  accidentRate: number;
  hazardReports: number;
  policeStationNearby: boolean;
  hospitalNearby: boolean;
  busyRoad: boolean;
}

export interface SafetyWarning {
  type: 'crime' | 'lighting' | 'accident' | 'hazard' | 'isolated';
  severity: 'low' | 'medium' | 'high';
  message: string;
  location: Location;
}

export interface Route {
  id: string;
  name: string;
  distance: number;
  duration: number;
  safetyScore: number;
  safetyFactors: SafetyFactors;
  warnings: SafetyWarning[];
  waypoints: Location[];
}

export interface SafetyPoint {
  id: string;
  type: 'police' | 'hospital' | 'crime_hotspot' | 'accident_zone' | 'hazard';
  name: string;
  location: Location;
  severity?: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface Trip {
  id: string;
  source: Location;
  destination: Location;
  selectedRoute: Route;
  status: 'pending' | 'in_progress' | 'completed' | 'emergency';
  startedAt: string;
}

export interface SafetySettings {
  womenSafetyMode: boolean;
  nightMode: boolean;
  shareTripAutomatically: boolean;
  emergencyContacts: EmergencyContact[];
}
