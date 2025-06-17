// app/(context)/HikeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Hike {
  id: string;
  hikeName: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  date: string;
  time: string;
  participants: string;
  carNeeded: boolean;
  joinedUsers: string[];
  completedBy: string[];
  provisions: {id: string; owner: string; name: string; type: 'consumable' | 'tool';}[];
  drivers: { id: string; capacity: number; riders: string[] }[];
  media: { id: string; uri: string; access: 'public' | 'members' }[];
  distanceKm?: number;
  durationHours?: number;
  elevationGainM?: number;
  difficulty?: 'Easy' | 'Moderate' | 'Hard';
}


type HikeContextType = {
  hike: Hike | null;
  setHike: (hike: Hike) => void;
  updateHike: (updated: Partial<Hike>) => void;
};

const HikeContext = createContext<HikeContextType | undefined>(undefined);

export default function HikeProvider({ children }: { children: ReactNode }) {
  const [hike, setHikeState] = useState<Hike | null>(null);

  const setHike = (newHike: Hike) => {
    setHikeState(newHike);
  };

  const updateHike = (updated: Partial<Hike>) => {
    setHikeState((prev) => (prev ? { ...prev, ...updated } : prev));
  };

  return (
    <HikeContext.Provider value={{ hike, setHike, updateHike }}>
      {children}
    </HikeContext.Provider>
  );
}

export function useHike() {
  const context = useContext(HikeContext);
  if (!context) {
    throw new Error('useHike must be used within a HikeProvider');
  }
  return context;
}
