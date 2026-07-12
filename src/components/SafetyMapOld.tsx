import React from 'react';
import { MapPin, Shield, AlertTriangle, Building, Crosshair } from 'lucide-react';
import type { Location, Route, SafetyPoint } from '../types';
import { getSafetyColor } from '../utils/safetyScoring';

interface SafetyMapProps {
  origin: Location | null;
  destination: Location | null;
  routes: Route[];
  selectedRoute: Route | null;
  safetyPoints: SafetyPoint[];
  isNightMode: boolean;
  currentLocation?: Location | null;
  onRouteSelect: (route: Route) => void;
}

export function SafetyMap({
  origin,
  destination,
  routes,
  selectedRoute,
  safetyPoints,
  isNightMode,
  onRouteSelect,
  currentLocation,
}: SafetyMapProps) {
  const bgClass = isNightMode ? 'bg-gray-800' : 'bg-gray-100';
  const gridColor = isNightMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  return (
    <div className={`w-full h-full ${bgClass} relative overflow-hidden`}>
      {/* Grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* SVG for routes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {routes.map((route, index) => {
          const color = getSafetyColor(route.safetyScore);
          const isSelected = selectedRoute?.id === route.id;
          const startX = 20;
          const endX = 80;
          const baseY = 50;
          const yOffset = (index - 1) * 8;

          return (
            <g key={route.id}>
              <path
                d={`M ${startX}% ${baseY}% Q ${50}% ${baseY + yOffset}% ${endX}% ${baseY}%`}
                fill="none"
                stroke={color}
                strokeWidth={isSelected ? 6 : 3}
                strokeOpacity={isSelected ? 1 : 0.5}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              {/* Animated dot for selected route */}
              {isSelected && (
                <circle r="5" fill={color}>
                  <animateMotion
                    dur="4s"
                    repeatCount="indefinite"
                    path={`M ${startX}% ${baseY}% Q ${50}% ${baseY + yOffset}% ${endX}% ${baseY}%`}
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Origin marker */}
      {origin && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{ left: '20%', top: '50%' }}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg ring-3 ring-white animate-pulse">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded shadow text-xs font-medium text-gray-700">
              A: {origin.address.substring(0, 20)}...
            </div>
          </div>
        </div>
      )}

      {/* Destination marker */}
      {destination && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{ left: '80%', top: '50%' }}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg ring-3 ring-white">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded shadow text-xs font-medium text-gray-700">
              B: {destination.address.substring(0, 15)}...
            </div>
          </div>
        </div>
      )}

      {/* Safety Points Markers */}
      {safetyPoints.map((point) => (
        <SafetyMarker key={point.id} point={point} isNightMode={isNightMode} />
      ))}

      {/* Route Legend */}
      {routes.length > 0 && (
        <div
          className={`absolute bottom-4 left-4 p-3 rounded-lg shadow-lg z-30 ${
            isNightMode ? 'bg-gray-900/95 text-white' : 'bg-white/95 text-gray-900'
          }`}
        >
          <p className="text-xs font-bold mb-2 uppercase tracking-wide">Routes</p>
          <div className="space-y-1">
            {routes.map((route) => (
              <button
                key={route.id}
                onClick={() => onRouteSelect(route)}
                className="flex items-center gap-2 text-xs hover:opacity-80 transition-opacity w-full text-left"
              >
                <div
                  className="w-5 h-1 rounded"
                  style={{ backgroundColor: getSafetyColor(route.safetyScore) }}
                />
                <span className={isNightMode ? 'text-gray-300' : 'text-gray-700'}>
                  {route.name}
                </span>
                <span className={`font-bold ${isNightMode ? 'text-white' : 'text-gray-900'}`}>
                  ({route.safetyScore}%)
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map markers legend */}
      {safetyPoints.length > 0 && (
        <div
          className={`absolute top-4 right-4 p-3 rounded-lg shadow-lg z-30 ${
            isNightMode ? 'bg-gray-900/95 text-white' : 'bg-white/95 text-gray-900'
          }`}
        >
          <p className="text-xs font-bold mb-2 uppercase tracking-wide">Map Legend</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Police Station</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Hospital</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Crime Hotspot</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Accident Zone</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Hazard</span>
            </div>
          </div>
        </div>
      )}

      {/* No routes message */}
      {routes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`text-center ${isNightMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <Crosshair className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Enter locations and click "Find Safest Route"</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SafetyMarker({ point, isNightMode }: { point: SafetyPoint; isNightMode: boolean }) {
  const colors: Record<string, { bg: string; ring: string }> = {
    police: { bg: 'bg-blue-500', ring: 'ring-blue-300' },
    hospital: { bg: 'bg-green-500', ring: 'ring-green-300' },
    crime_hotspot: { bg: 'bg-red-500', ring: 'ring-red-300' },
    accident_zone: { bg: 'bg-orange-500', ring: 'ring-orange-300' },
    hazard: { bg: 'bg-yellow-500', ring: 'ring-yellow-300' },
  };

  const { bg, ring } = colors[point.type] || { bg: 'bg-gray-500', ring: 'ring-gray-300' };

  // Calculate position based on coordinates (Jaipur is roughly 26.8-26.9 lat, 75.7-75.85 lng)
  const left = ((point.location.lng - 75.70) / 0.15) * 60 + 10;
  const top = ((26.95 - point.location.lat) / 0.15) * 60 + 20;

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 group"
      style={{ left: `${Math.min(85, Math.max(10, left))}%`, top: `${Math.min(80, Math.max(10, top))}%` }}
    >
      <div className={`w-5 h-5 rounded-full ${bg} ring-2 ${ring} flex items-center justify-center shadow-md cursor-pointer`}>
        {point.type === 'police' && <Shield className="w-3 h-3 text-white" />}
        {point.type === 'hospital' && <Building className="w-3 h-3 text-white" />}
        {point.type === 'crime_hotspot' && <AlertTriangle className="w-3 h-3 text-white" />}
        {point.type === 'accident_zone' && <AlertTriangle className="w-3 h-3 text-white" />}
        {point.type === 'hazard' && <AlertTriangle className="w-3 h-3 text-white" />}
      </div>
      {/* Tooltip */}
      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${
        isNightMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      } shadow-lg`}>
        {point.name}
      </div>
    </div>
  );
}

export default SafetyMap;
