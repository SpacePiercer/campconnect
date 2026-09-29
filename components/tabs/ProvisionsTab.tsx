// components/tabs/ProvisionsTab.tsx
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Modal, TextInput, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHike } from '../../app/(context)/HikeContext';

export default function ProvisionsTab() {
  const { hike, updateHike } = useHike();
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemOwner, setNewItemOwner] = useState('');
  const [newItemType, setNewItemType] = useState<'consumable'|'tool'>('consumable');

  if (!hike) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading provisions…</Text>
      </View>
    );
  }

  // Partition items into consumables and tools
  const consumables = hike.provisions.filter(item => item.type === 'consumable');
  const tools = hike.provisions.filter(item => item.type === 'tool');

  const renderSection = (title: string, items: typeof hike.provisions) => {
    // Group by owner
    const byOwner: Record<string, typeof items> = {};
    items.forEach(item => {
      if (!byOwner[item.owner]) byOwner[item.owner] = [];
      byOwner[item.owner].push(item);
    });

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tilesRow}>
          {Object.entries(byOwner).map(([owner, list]) => (
            <View key={owner} style={styles.ownerTile}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{owner.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.ownerName}>{owner}</Text>
              <Text style={styles.itemCount}>{list.length} items</Text>
              {/* TODO: onPress opens detail panel */}
            </View>
          ))}

          <Pressable style={styles.addTile} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={32} color="#4ade80" />
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  };

  // Modal to add a new item
  const handleSave = () => {
    const newItem = { id: Date.now().toString(), owner: newItemOwner, name: newItemName, type: newItemType };
    updateHike({ provisions: [...hike.provisions, newItem] });
    setModalVisible(false);
    setNewItemName('');
    setNewItemOwner('');
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {renderSection('🍎 Consumables', consumables)}
        {renderSection('🛠️ Tools & Gear', tools)}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Item</Text>
            <TextInput
              style={styles.input}
              placeholder="Owner"
              placeholderTextColor="#777"
              value={newItemOwner}
              onChangeText={setNewItemOwner}
            />
            <TextInput
              style={styles.input}
              placeholder="Item name"
              placeholderTextColor="#777"
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <View style={styles.typeSelector}>
              <Pressable onPress={() => setNewItemType('consumable')}>
                <Text style={[styles.typeText, newItemType==='consumable' && styles.typeSelected]}>Consumable</Text>
              </Pressable>
              <Pressable onPress={() => setNewItemType('tool')}>
                <Text style={[styles.typeText, newItemType==='tool' && styles.typeSelected]}>Tool</Text>
              </Pressable>
            </View>
            <View style={styles.modalButtons}>
              <Button title="Save" onPress={handleSave} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex:1, justifyContent:'center', alignItems:'center' },
  loadingText: { color:'#aaa' },
  section: { marginBottom: 24 },
  sectionTitle: { color:'#fff', fontSize:18, fontWeight:'600', marginLeft:16, marginBottom:8 },
  tilesRow: { paddingLeft:16 },
  ownerTile: { width:100, marginRight:12, alignItems:'center' },
  avatar: { width:48, height:48, borderRadius:12, backgroundColor:'#333', justifyContent:'center', alignItems:'center' },
  avatarText:{ color:'#fff', fontSize:20, fontWeight:'bold' },
  ownerName:{ color:'#fff', marginTop:4, fontSize:12 },
  itemCount:{ color:'#aaa', fontSize:10 },
  addTile:{ width:100, marginRight:12, alignItems:'center', justifyContent:'center' },
  addText:{ color:'#4ade80', marginTop:4, fontSize:12 },
  modalOverlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.6)', justifyContent:'center', alignItems:'center' },
  modalContent:{ width:'80%', backgroundColor:'#111', borderRadius:8, padding:16 },
  modalTitle:{ color:'#fff', fontSize:18, fontWeight:'600', marginBottom:12 },
  input:{ borderWidth:1, borderColor:'#444', borderRadius:6, padding:8, marginBottom:12, color:'#fff' },
  typeSelector:{ flexDirection:'row', justifyContent:'space-around', marginBottom:12 },
  typeText:{ color:'#aaa', padding:4 },
  typeSelected:{ color:'#4ade80', fontWeight:'600' },
  modalButtons:{ flexDirection:'row', justifyContent:'space-between' }
});
