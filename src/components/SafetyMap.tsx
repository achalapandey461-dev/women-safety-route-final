
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { Location, Route, SafetyPoint } from "../types";

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

const markerIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ChangeView({
  center,
}: {
  center: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 15, {
      animate: true,
      duration: 1.5,
    });
  }, [center]);

  return null;
}

export default function SafetyMap({
  origin,
  destination,
  routes,
  selectedRoute,
  safetyPoints,
  isNightMode,
  currentLocation,
  onRouteSelect,
}: SafetyMapProps) {

  const center: [number, number] =
    currentLocation
      ? [currentLocation.lat, currentLocation.lng]
      : origin
      ? [origin.lat, origin.lng]
      : [26.9124, 75.7873];

  const [movingIndex, setMovingIndex] = useState(0);

  useEffect(() => {

    if (!selectedRoute) return;

    setMovingIndex(0);

    const timer = setInterval(() => {

      setMovingIndex((prev) => {

        if (prev >= selectedRoute.waypoints.length - 1) {
          return prev;
        }

        return prev + 1;

      });

    }, 300);

    return () => clearInterval(timer);

  }, [selectedRoute]);

  const movingLocation =
    selectedRoute &&
    selectedRoute.waypoints.length > 0
      ? selectedRoute.waypoints[movingIndex]
      : null;

  return (

    <MapContainer
      center={center}
      zoom={15}
      style={{
        width: "100%",
        height: "100%",
        zIndex:0,
      }}
    >

      <ChangeView center={center} />

      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
            {/* Start Marker */}
      {origin && (
        <Marker
          position={[origin.lat, origin.lng]}
          icon={markerIcon}
        >
          <Popup>
            <b>Start Location</b>
            <br />
            {origin.address}
          </Popup>
        </Marker>
      )}

      {/* Destination Marker */}
      {destination && (
        <Marker
          position={[destination.lat, destination.lng]}
          icon={markerIcon}
        >
          <Popup>
            <b>Destination</b>
            <br />
            {destination.address}
          </Popup>
        </Marker>
      )}

      {/* Current Live Location */}
      {currentLocation && (
        <Marker
          position={[currentLocation.lat, currentLocation.lng]}
          icon={markerIcon}
        >
          <Popup>
            📍 You are here
          </Popup>
        </Marker>
      )}

      {/* Route Line */}
      {selectedRoute &&
        selectedRoute.waypoints.length > 1 && (
          <Polyline
            positions={selectedRoute.waypoints.map((point) => [
              point.lat,
              point.lng,
            ])}
            pathOptions={{
              color: "#16a34a",
              weight: 7,
            }}
          />
      )}

      {/* Moving Marker */}
      {movingLocation && (
        <Marker
          position={[
            movingLocation.lat,
            movingLocation.lng,
          ]}
          icon={markerIcon}
        >
          <Popup>
            🚗 Moving...
          </Popup>
        </Marker>
      )}
            {/* Safety Points */}
      {safetyPoints.map((point) => (
        <Marker
          key={point.id}
          position={[
            point.location.lat,
            point.location.lng,
          ]}
          icon={markerIcon}
        >
          <Popup>
            <div style={{ minWidth: "180px" }}>
              <h3
                style={{
                  margin: 0,
                  color: "#2563eb",
                  fontSize: "16px",
                }}
              >
                {point.name}
              </h3>

              <p
                style={{
                  marginTop: "6px",
                  marginBottom: "4px",
                }}
              >
                Type :
                <strong> {point.type}</strong>
              </p>

              {"severity" in point && (
                <p>
                  Severity :
                  <strong> {point.severity}</strong>
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Night Overlay */}
      
          </MapContainer>
  );
}