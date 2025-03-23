// components/ShortcutItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Linking } from 'react-native';

interface ShortcutItemProps {
  iconName: keyof typeof Ionicons.glyphMap;  // keyof typeof로 Ionicons의 모든 아이콘 이름을 가져올 수 있음
  title: string;
  url: string;
}

function ShortcutItem(props: ShortcutItemProps) {
  const { iconName, title, url } = props;

  function handlePress() {
    Linking.openURL(url).catch((err) => console.warn('링크 열기 실패:', err));
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <Ionicons name={iconName} size={24} color="#333" style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Ionicons name="open-outline" size={20} color="#999" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    backgroundColor: '#fff',
  },
  icon: {
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});

export default ShortcutItem;
