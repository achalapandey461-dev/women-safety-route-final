import React, { createContext, useContext, useState, useCallback } from 'react';
import type { SafetySettings, EmergencyContact, Trip, Location, Route } from '../types';

interface SafetyContextType {
  safetySettings: SafetySettings;
  isNightMode: boolean;
  toggleNightMode: () => void;
  toggleWomenSafetyMode: () => void;
  emergencyContacts: EmergencyContact[];
  activeTrip: Trip | null;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  removeEmergencyContact: (id: string) => void;
  startTrip: (source: Location, destination: Location, route: Route) => void;
  endTrip: () => void;
}

const SafetyContext = createContext<SafetyContextType | null>(null);

export function SafetyProvider({ children }: { children: React.ReactNode }) {
  const [safetySettings, setSafetySettings] = useState<SafetySettings>({
    womenSafetyMode: true,
    nightMode: false,
    shareTripAutomatically: false,
    emergencyContacts: [],
  });
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  const isNightMode = safetySettings.nightMode;

  const toggleNightMode = useCallback(() => {
    setSafetySettings(prev => ({ ...prev, nightMode: !prev.nightMode }));
  }, []);

  const toggleWomenSafetyMode = useCallback(() => {
    setSafetySettings(prev => ({ ...prev, womenSafetyMode: !prev.womenSafetyMode }));
  }, []);

  const addEmergencyContact = useCallback((contact: Omit<EmergencyContact, 'id'>) => {
    const newContact: EmergencyContact = {
      ...contact,
      id: `contact-${Date.now()}`,
    };
    setSafetySettings(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, newContact],
    }));
  }, []);

  const removeEmergencyContact = useCallback((id: string) => {
    setSafetySettings(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter(c => c.id !== id),
    }));
  }, []);

  const startTrip = useCallback((source: Location, destination: Location, route: Route) => {
    const trip: Trip = {
      id: `trip-${Date.now()}`,
      source,
      destination,
      selectedRoute: route,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
    };
    setActiveTrip(trip);
  }, []);

  const endTrip = useCallback(() => {
    setActiveTrip(null);
  }, []);

  return (
    <SafetyContext.Provider
      value={{
        safetySettings,
        isNightMode,
        toggleNightMode,
        toggleWomenSafetyMode,
        emergencyContacts: safetySettings.emergencyContacts,
        activeTrip,
        addEmergencyContact,
        removeEmergencyContact,
        startTrip,
        endTrip,
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within SafetyProvider');
  }
  return context;
}
