import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Animated, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

const AVATAR_GRADIENTS = [
  ['#3B82F6', '#1D4ED8'],
  ['#8B5CF6', '#6D28D9'],
  ['#10B981', '#059669'],
  ['#F59E0B', '#D97706'],
  ['#EF4444', '#DC2626'],
  ['#06B6D4', '#0891B2'],
] as const;

function getGradient(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

function SkeletonCard() {
  const anim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.skeletonCard, { opacity: anim }]}>
      <View style={styles.skeletonAvatar} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <View style={[styles.skeletonLine, { width: '55%', height: 16, marginBottom: 8 }]} />
        <View style={[styles.skeletonLine, { width: '35%', height: 12 }]} />
      </View>
      <View style={[styles.skeletonLine, { width: 80, height: 32, borderRadius: 16 }]} />
    </Animated.View>
  );
}

export default function ProvidersScreen({ navigation }: any) {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useFocusEffect(useCallback(() => { fetchProviders(); }, []));

  const fetchProviders = async () => {
    try {
      const response = await api.get('/auth/providers');
      setProviders(response.data.data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  const filtered = providers.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Kuaforler</Text>
        <Text style={styles.pageCount}>{providers.length} kuafor</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Kuafor ara..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={COLORS.textMuted}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <FlatList
          data={[1, 2, 3, 4]}
          keyExtractor={(i) => String(i)}
          renderItem={() => <SkeletonCard />}
          contentContainerStyle={styles.list}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, SHADOWS.sm]}
              onPress={() => navigation.navigate('BookAppointment', { provider: item })}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={getGradient(item.full_name)}
                style={styles.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarText}>{item.full_name.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
              <View style={styles.info}>
                <Text style={styles.name}>{item.full_name}</Text>
                <View style={styles.phoneRow}>
                  <Ionicons name="call-outline" size={12} color={COLORS.textMuted} />
                  <Text style={styles.phone}>{item.phone}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.bookBtn}
                onPress={() => navigation.navigate('BookAppointment', { provider: item })}
                activeOpacity={0.85}
              >
                <Text style={styles.bookBtnText}>Randevu Al</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="cut-outline" size={48} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>
                {search ? 'Kuafor bulunamadi' : 'Henuz kuafor yok'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {search ? `"${search}" icin sonuc yok` : 'Yakin zamanda kuaforler eklenecek'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  pageHeader: {
    paddingHorizontal: SIZES.padding,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 52,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.textPrimary },
  pageCount: { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textMuted },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginVertical: 12,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: 14,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontFamily: FONTS.regular,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },
  list: { paddingHorizontal: SIZES.padding, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: 14,
    marginBottom: 10,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontFamily: FONTS.bold, color: COLORS.white, fontSize: 22 },
  info: { flex: 1, marginLeft: 14 },
  name: { fontFamily: FONTS.semiBold, fontSize: SIZES.lg, color: COLORS.textPrimary },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  phone: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary },
  bookBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookBtnText: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.white },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIconBox: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: COLORS.primary + '12',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: SIZES.xl, color: COLORS.textPrimary, textAlign: 'center' },
  emptySubtitle: { fontFamily: FONTS.regular, fontSize: SIZES.md, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
  skeletonCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: SIZES.radiusLg,
    padding: 14, marginBottom: 10,
  },
  skeletonAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.border },
  skeletonLine: { backgroundColor: COLORS.border, borderRadius: 4 },
});
