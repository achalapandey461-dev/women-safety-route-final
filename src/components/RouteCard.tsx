import React from 'react';
import { Shield, AlertTriangle, Lightbulb, Building, Cross, Car, AlertCircle, Clock, MapPin } from 'lucide-react';
import type { Route } from '../types';
import { getSafetyColor, formatDistance, formatDuration } from '../utils/safetyScoring';

interface RouteCardProps {
  route: Route;
  isSelected: boolean;
  rank: number;
  onSelect: () => void;
  isNightMode: boolean;
}

export function RouteCard({ route, isSelected, rank, onSelect, isNightMode }: RouteCardProps) {
  const safetyColor = getSafetyColor(route.safetyScore);
  const isSafest = rank === 1;

  const getCardClass = () => {
    if (isSafest) {
      return isNightMode
        ? 'bg-green-900/30 border-green-500 ring-2 ring-green-500/50'
        : 'bg-green-50 border-green-500 ring-2 ring-green-500/50';
    }
    if (isSelected) {
      return isNightMode
        ? 'bg-gray-800 border-primary-500 ring-2 ring-primary-500/50'
        : 'bg-white border-primary-500 ring-2 ring-primary-500/50';
    }
    return isNightMode
      ? 'bg-gray-800 border-gray-700 hover:border-gray-500'
      : 'bg-white border-gray-200 hover:border-gray-300';
  };

  const factors = route.safetyFactors;

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 relative ${getCardClass()}`}
    >
      {/* Recommended badge for safest route */}
      {isSafest && (
        <div className="absolute -top-2 left-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow">
          RECOMMENDED - SAFEST
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-white shadow-lg"
            style={{ backgroundColor: safetyColor }}
          >
            {rank}
          </div>
          <div>
            <h3 className={`font-bold text-lg ${isNightMode ? 'text-white' : 'text-gray-900'}`}>
              {route.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(route.duration)}</span>
              <MapPin className="w-4 h-4 ml-2" />
              <span>{formatDistance(route.distance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Score Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm font-medium ${isNightMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Safety Score
          </span>
          <span
            className="text-2xl font-bold"
            style={{ color: safetyColor }}
          >
            {route.safetyScore}%
          </span>
        </div>
        <div className={`h-3 rounded-full ${isNightMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${route.safetyScore}%`,
              backgroundColor: safetyColor,
            }}
          />
        </div>
      </div>

      {/* Safety Factors Grid */}
      <div className="grid grid-cols-2 gap-2">
        <FactorRow
          icon={<AlertTriangle className="w-4 h-4" />}
          label="Crime Risk"
          value={factors.crimeRisk}
          inverseColor
          isNightMode={isNightMode}
        />
        <FactorRow
          icon={<Lightbulb className="w-4 h-4" />}
          label="Poor Lighting"
          value={factors.poorLighting}
          inverseColor
          isNightMode={isNightMode}
        />
        <FactorRow
          icon={<AlertCircle className="w-4 h-4" />}
          label="Accident Rate"
          value={factors.accidentRate}
          inverseColor
          isNightMode={isNightMode}
        />
        <FactorRow
          icon={<AlertTriangle className="w-4 h-4" />}
          label="Hazard Reports"
          value={factors.hazardReports * 10}
          inverseColor
          isNightMode={isNightMode}
        />
      </div>

      {/* Safety Features */}
      <div className={`mt-3 pt-3 border-t ${isNightMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className={`text-xs font-semibold mb-2 ${isNightMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>
          Safety Features
        </p>
        <div className="grid grid-cols-2 gap-2">
          <BooleanIndicator
            icon={<Shield className="w-4 h-4 text-blue-500" />}
            label="Police Station Nearby"
            value={factors.policeStationNearby}
            isNightMode={isNightMode}
          />
          <BooleanIndicator
            icon={<Cross className="w-4 h-4 text-green-500" />}
            label="Hospital Nearby"
            value={factors.hospitalNearby}
            isNightMode={isNightMode}
          />
          <BooleanIndicator
            icon={<Car className="w-4 h-4 text-purple-500" />}
            label="Busy Road"
            value={factors.busyRoad}
            isNightMode={isNightMode}
          />
        </div>
      </div>

      {/* Warnings */}
      {route.warnings.length > 0 && (
        <div className={`mt-3 pt-3 border-t ${isNightMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {route.warnings.map((warning, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <AlertTriangle className={`w-3 h-3 ${warning.severity === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
              <span className={isNightMode ? 'text-gray-300' : 'text-gray-600'}>
                {warning.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FactorRow({
  icon,
  label,
  value,
  inverseColor,
  isNightMode,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  inverseColor?: boolean;
  isNightMode: boolean;
}) {
  // For inverse values (like crime risk), low is good (green)
  const percentage = inverseColor ? 100 - value : value;
  const color = percentage >= 60 ? '#10b981' : percentage >= 30 ? '#f59e0b' : '#ef4444';

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${isNightMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <div style={{ color }}>{icon}</div>
      <div className="flex-1">
        <p className={`text-[10px] ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
        <p className="text-sm font-bold" style={{ color }}>
          {value}%
        </p>
      </div>
    </div>
  );
}

function BooleanIndicator({
  icon,
  label,
  value,
  isNightMode,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  isNightMode: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${isNightMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <div className={value ? 'opacity-100' : 'opacity-30'}>{icon}</div>
      <div className="flex-1">
        <p className={`text-[10px] ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
        <p className={`text-xs font-semibold ${value ? 'text-green-500' : isNightMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {value ? 'Yes' : 'No'}
        </p>
      </div>
    </div>
  );
}

export default RouteCard;
