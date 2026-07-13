import React, { useState, useCallback,useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Shield, Moon, Sun, Navigation, Route as RouteIcon, Loader2 } from 'lucide-react';
import { SafetyProvider, useSafety } from './contexts/SafetyContext';
import SafetyMap from './components/SafetyMap';
import { LocationSearch } from './components/LocationSearch';
import { RouteCard } from './components/RouteCard';
import { SOSButton } from './components/SOSButton';
import TripSharing from './components/TripSharing';
import type { Location, Route as RouteType, SafetyPoint } from './types';
import {
  generateDemoRoutes,
  generateDemoSafetyPoints,
  JAIPUR_LOCATIONS,
} from './utils/safetyScoring';
async function getCoordinates(address: string) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
  );

  const data = await response.json();

  if (!data.length) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    address: data[0].display_name,
  };
}

function AppContent() {
  const { isNightMode, toggleNightMode, womenSafetyMode, toggleWomenSafetyMode, activeTrip, startTrip, endTrip } = useSafety();

  // State
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteType | null>(null);
  const [safetyPoints] = useState<SafetyPoint[]>(() => generateDemoSafetyPoints());
  const [isCalculating, setIsCalculating] = useState(false);
  const [tripStarted, setTripStarted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [originLocation, setOriginLocation] = useState<Location | null>(null);
   const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);
  useEffect(() => {
  if (!navigator.geolocation) {
    console.log("Geolocation is not supported");
    return;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        address: "Current Location",
      });
    },
    (error) => {
      console.log("Location Error:", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}, []);

  // Get locations from addresses
  const getOriginLocation = (): Location | null => {
    if (!origin) return null;
    return JAIPUR_LOCATIONS[origin] || { lat: 26.8914, lng: 75.7825, address: origin };
  };

  const getDestinationLocation = (): Location | null => {
    if (!destination) return null;
    return JAIPUR_LOCATIONS[destination] || { lat: 26.8515, lng: 75.8215, address: destination };
  };

  // Handle route calculation
const handleFindRoutes = useCallback(async() => {
  if (!origin || !destination) {
    return;
  }

  setIsCalculating(true);
  setRoutes([]);
  setSelectedRoute(null);
  
  try {
    const originLoc = await getCoordinates(origin);
    const destLoc = await getCoordinates(destination);

    if (!originLoc || !destLoc) {
      alert("Location not found!");
      setIsCalculating(false);
      return;
    }

    setOriginLocation(originLoc);
    setDestinationLocation(destLoc);

    const demoRoutes = generateDemoRoutes(originLoc, destLoc, isNightMode);

    setRoutes(demoRoutes);
    setSelectedRoute(demoRoutes[0]);

  } catch (error) {
    console.error(error);
  }

  setIsCalculating(false);
}, [origin, destination, isNightMode]);

const handleStartTrip = () => {
  if (selectedRoute && originLocation && destinationLocation) {
    startTrip(originLocation, destinationLocation, selectedRoute);
    setTripStarted(true);
  }
};




  // End trip
  const handleEndTrip = () => {
    endTrip();
    setTripStarted(false);
  };

  const bgClass = isNightMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardClass = isNightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = isNightMode ? 'text-white' : 'text-gray-900';

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      {/* Header */}
      <header className={`sticky top-0 z-40 border-b shadow-sm ${cardClass}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pink-500 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${textClass}`}>SafeHer</h1>
              <p className={`text-xs ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Women's Safety Route Planner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Women Safety Mode Toggle */}
            <button
              onClick={toggleWomenSafetyMode}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all shadow ${
                womenSafetyMode
                  ? 'bg-pink-500 text-white ring-2 ring-pink-300'
                  : isNightMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {womenSafetyMode ? 'Women\'s Safety ON' : 'Women\'s Safety OFF'}
            </button>

            {/* Trip Sharing */}
            <TripSharing trip={tripStarted ? activeTrip : null} isNightMode={isNightMode} />

            {/* Night Mode Toggle */}
            <button
              onClick={toggleNightMode}
              className={`p-2 rounded-xl transition-colors ${
                isNightMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {isNightMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-blue-500" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search Card */}
            <div className={`rounded-2xl border shadow-lg p-4 ${cardClass}`}>
              <h2 className={`text-lg font-bold mb-4 ${textClass}`}>Plan Your Safe Route</h2>

              {/* From Input */}
              <div className="mb-3">
                <LocationSearch
                  label="From"
                  placeholder="e.g., Vaishali Nagar, Jaipur"
                  value={origin}
                  onChange={setOrigin}
                  isNightMode={isNightMode}
                />
              </div>

              {/* To Input */}
              <div className="mb-4">
                <LocationSearch
                  label="To"
                  placeholder="e.g., Rajasthan College of Engineering for Women, Jaipur"
                  value={destination}
                  onChange={setDestination}
                  isNightMode={isNightMode}
                />
              </div>

              {/* Find Route Button */}
              <button
                onClick={handleFindRoutes}
                disabled={isCalculating || !origin || !destination}
                className="w-full py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Routes...
                  </>
                ) : (
                  <>
                    <RouteIcon className="w-5 h-5" />
                    Find Safest Route
                  </>
                )}
              </button>
            </div>

            {/* Routes List */}
            {routes.length > 0 && (
              <div className={`rounded-2xl border shadow-lg p-4 ${cardClass}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-lg font-bold ${textClass}`}>
                    Recommended Routes
                  </h3>
                  {tripStarted && (
                    <span className="text-sm text-green-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Trip Active
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {routes.map((route, index) => (
                    <RouteCard
                      key={route.id}
                      route={route}
                      isSelected={selectedRoute?.id === route.id}
                      rank={index + 1}
                      onSelect={() => setSelectedRoute(route)}
                      isNightMode={isNightMode}
                    />
                  ))}
                </div>

                {/* Start/End Trip Button */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {tripStarted ? (
                    <button
                      onClick={handleEndTrip}
                      className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
                    >
                      End Trip
                    </button>
                  ) : (
                    <button
                      onClick={handleStartTrip}
                      disabled={!selectedRoute}
                      className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-5 h-5" />
                      Start Journey
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Map */}
          <div className="lg:col-span-2">
            <div
              className={`rounded-2xl border shadow-lg overflow-hidden ${cardClass}`}
              style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}
            >
              <SafetyMap
  origin={originLocation}
  destination={destinationLocation}
  routes={routes}
  selectedRoute={selectedRoute}
  safetyPoints={safetyPoints}
  isNightMode={isNightMode}
  onRouteSelect={setSelectedRoute}
  currentLocation={currentLocation}
/>
            </div>

            {/* Selected Route Summary */}
            {selectedRoute && (
              <div className={`mt-4 rounded-xl border shadow-lg p-4 ${cardClass} relative`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className={`font-bold ${textClass}`}>
                        {selectedRoute.name}
                      </h3>
                      <p className={`text-sm ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {(selectedRoute.distance / 1000).toFixed(1)} km - {Math.floor(selectedRoute.duration / 60)} min
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-3xl font-bold"
                      style={{ color: selectedRoute.safetyScore >= 70 ? '#10b981' : selectedRoute.safetyScore >= 40 ? '#f59e0b' : '#ef4444' }}
                    >
                      {selectedRoute.safetyScore}%
                    </p>
                    <p className={`text-xs ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Safety Score
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* SOS Button */}
      <SOSButton isNightMode={isNightMode} />

      {/* Demo Mode Notice */}
      <div className={`fixed bottom-6 left-6 px-3 py-1 rounded-lg text-xs ${
        isNightMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
      } shadow-lg border ${isNightMode ? 'border-gray-700' : 'border-gray-200'}`}>
        Demo Mode - Jaipur Routes
      </div>
    </div>
  );
}

function App() {
  return (
    <SafetyProvider>
      <AppContent />
    </SafetyProvider>
  );
}

export default App;
