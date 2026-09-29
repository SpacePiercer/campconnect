import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useHike } from '../../app/(context)/HikeContext';

export default function ProvisionsTab() {
  const { hike } = useHike();

  if (!hike) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <FlatList
      style={styles.container}
      data={hike.provisions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <View style={styles.iconPlaceholder} />
          <Text style={styles.text}>{item.name}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No provisions added</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  item: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconPlaceholder: { width: 40, height: 40, backgroundColor: '#ccc', borderRadius: 8, marginRight: 12 },
  text: { fontSize: 16 },
  empty: { textAlign: 'center', marginTop: 20, color: '#888' },
});
