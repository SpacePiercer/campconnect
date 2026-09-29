// app/(context)/HikeContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  ReactElement,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of a single hike
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
  provisions: { id: string; owner: string; name: string; type: 'consumable' | 'tool' }[];
  drivers: { id: string; capacity: number; riders: string[] }[];
  media: { id: string; uri: string; access: 'public' | 'members' }[];
  distanceKm?: number;
  durationHours?: number;
  elevationGainM?: number;
  difficulty?: 'Easy' | 'Moderate' | 'Hard';
}

interface HikeContextType {
  hike: Hike | null;
  loadHike: (id: string) => Promise<void>; // ✅ Added to the type
  updateHike: (data: Partial<Hike>) => Promise<void>;
}

const HikeContext = createContext<HikeContextType | undefined>(undefined);

export function useHike(): HikeContextType {
  const ctx = useContext(HikeContext);
  if (!ctx) {
    throw new Error('useHike must be used within a HikeProvider');
  }
  return ctx;
}

export default function HikeProvider({ children }: { children: ReactNode }): ReactElement {
  const [hike, setHike] = useState<Hike | null>(null);

  const loadHike = async (id: string) => {
    try {
      const raw = await AsyncStorage.getItem('hikes');
      const list: Hike[] = raw ? JSON.parse(raw) : [];
      const found = list.find(item => item.id === id) || null;
      setHike(found);
    } catch (err) {
      console.error('Error loading hike:', err);
      setHike(null);
    }
  };

  const updateHike = async (data: Partial<Hike>) => {
    if (!hike) return;
    const updated = { ...hike, ...data };
    setHike(updated);
    try {
      const raw = await AsyncStorage.getItem('hikes');
      const list: Hike[] = raw ? JSON.parse(raw) : [];
      const newList = list.map(item => (item.id === updated.id ? updated : item));
      await AsyncStorage.setItem('hikes', JSON.stringify(newList));
    } catch (err) {
      console.error('Error updating hike list:', err);
    }
  };

  return (
    <HikeContext.Provider value={{ hike, loadHike, updateHike }}>
      {children}
    </HikeContext.Provider>
  );
}