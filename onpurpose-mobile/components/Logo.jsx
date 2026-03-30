import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../lib/constants';

export default function Logo({ size = 'md', showTagline = false }) {
  const dim = size === 'lg' ? 64 : size === 'sm' ? 32 : 44;
  const fontSize = size === 'lg' ? 24 : size === 'sm' ? 14 : 18;
  
  return (
    <View style={styles.wrap}>
      <View style={[styles.icon, { width: dim, height: dim, borderRadius: dim * 0.22 }]}>
        <View style={[styles.hg, { width: dim * 0.56, height: dim * 0.72 }]}>
          <View style={[styles.top, { borderBottomWidth: dim * 0.36 }]} />
          <View style={[styles.bot, { borderTopWidth: dim * 0.36 }]} />
          <View style={[styles.dot, { 
            width: dim * 0.14, height: dim * 0.14, 
            borderRadius: dim * 0.07,
            bottom: dim * 0.05, left: -dim * 0.02
          }]} />
        </View>
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.name, { fontSize }]}>OnPurpose</Text>
        {showTagline && (
          <Text style={styles.tag}>Connection, not dating</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { backgroundColor: COLORS.blue, alignItems: 'center', 
          justifyContent: 'center' },
  hg: { alignItems: 'center', justifyContent: 'space-between' },
  top: { width: 0, height: 0, borderLeftWidth: 0, 
         borderRightWidth: 0, borderBottomColor: 'white',
         borderLeftColor: 'transparent', 
         borderRightColor: 'transparent' },
  bot: { width: 0, height: 0, borderLeftWidth: 0,
         borderRightWidth: 0, borderTopColor: 'white',
         borderLeftColor: 'transparent', 
         borderRightColor: 'transparent' },
  dot: { position: 'absolute', backgroundColor: COLORS.blue },
  textWrap: { flexDirection: 'column' },
  name: { fontFamily: 'serif', fontWeight: '700', 
          color: COLORS.navy, letterSpacing: -0.3 },
  tag: { fontSize: 10, color: COLORS.blue, 
         fontFamily: 'sans-serif', marginTop: 1 },
});
