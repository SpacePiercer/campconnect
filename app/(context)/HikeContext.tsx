// app/(context)/HikeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Hike = {
  id: string;
  title: string;
  date: string;
  location: { latitude: number; longitude: number };
  participants: string[];
  provisions: { owner: string; name: string; type: 'consumable' | 'tool' }[];
  carpool: {
    drivers: { id: string; capacity: number; riders: string[] }[];
    items: { owner: string; name: string; type: 'consumable' | 'tool' }[];
  } | null;
};

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
