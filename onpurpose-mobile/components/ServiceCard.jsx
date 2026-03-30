import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS } from '../lib/constants';

export default function ServiceCard({ service, onPress }) {
  const categoryColors = {
    'Career Coaching': ['#667eea', '#764ba2'],
    'Local Expert': ['#f093fb', '#f5576c'],
    'Cultural Guide': ['#4facfe', '#00f2fe'],
    'Marketing Help': ['#43e97b', '#38f9d7'],
    'Fitness Training': ['#fa709a', '#fee140'],
    'Tutoring': ['#30cfd0', '#330867'],
    'Life Coaching': ['#a8edea', '#fed6e3'],
  };

  const colors = categoryColors[service.category] || ['#667eea', '#764ba2'];
  const initials = service.provider?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(service)}>
      <View style={[styles.header, { backgroundColor: colors[0] }]}>
        <Text style={styles.emoji}>{service.category?.split(' ')[0] === 'Career' ? '💼' : '🌟'}</Text>
        <View style={styles.pills}>
          <Text style={styles.category}>{service.category}</Text>
          {service.isOnline && <Text style={styles.online}>Online</Text>}
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.provider}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.providerName}>{service.provider?.name}</Text>
        </View>
        
        <Text style={styles.title}>{service.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {service.description}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.left}>
            {service.avgRating && (
              <Text style={styles.rating}>⭐ {service.avgRating.toFixed(1)}</Text>
            )}
            {service.trustScore > 0 && (
              <Text style={styles.trusted}>✓ Trusted</Text>
            )}
          </View>
          <Text style={styles.price}>${service.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    margin: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    height: 100,
    padding: 16,
    justifyContent: 'space-between',
  },
  emoji: {
    fontSize: 32,
    alignSelf: 'center',
  },
  pills: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  category: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
  },
  online: {
    backgroundColor: COLORS.success,
    color: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontFamily: FONTS.bodyMedium,
  },
  content: {
    padding: 16,
  },
  provider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: COLORS.white,
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
  },
  providerName: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    gap: 8,
  },
  rating: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.muted,
  },
  trusted: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.success,
  },
  price: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.blue,
  },
});
