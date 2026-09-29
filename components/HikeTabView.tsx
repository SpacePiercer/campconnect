// components/HikeTabView.tsx
import React, { useState, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { useHike } from '../app/(context)/HikeContext';
import OverviewTab from './tabs/OverviewTab';
import ParticipantsTab from './tabs/ParticipantsTab';
import ProvisionsTab from './tabs/ProvisionsTab';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HikeTabView() {
  const { hike } = useHike();
  const [index, setIndex] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Load the current user token once
  React.useEffect(() => {
    AsyncStorage.getItem('userToken').then(setUserId).catch(console.error);
  }, []);

  if (!hike) return null;
  const joined = userId != null && hike.joinedUsers.includes(userId);

  // Always show Overview + Participants
  const routes = [
    { key: 'overview',    title: 'Overview' },
    { key: 'participants',title: 'Participants' },
  ];
  // Only show Provisions if user has joined
  if (joined) {
    routes.push({ key: 'provisions', title: 'Provisions' });
  }

  const scenes: Record<string, React.ComponentType> = {
    overview:     OverviewTab,
    participants: ParticipantsTab,
  };
  if (joined) scenes.provisions = ProvisionsTab;

  const renderScene = ({ route }: { route: { key: string } }) => {
    const Scene = scenes[route.key];
    return Scene ? <Scene /> : null;
  };

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: Dimensions.get('window').width }}
    />
  );
}
