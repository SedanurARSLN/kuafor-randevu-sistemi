import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

const STATUS_MAP: Record<string, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  pending:   { label: 'Bekliyor',    color: COLORS.pending,   icon: 'time-outline' },
  confirmed: { label: 'Onaylandı',   color: COLORS.confirmed, icon: 'checkmark-circle-outline' },
  cancelled: { label: 'İptal',       color: COLORS.cancelled, icon: 'close-circle-outline' },
  completed: { label: 'Tamamlandı', color: COLORS.completed, icon: 'checkmark-done-outline' },
};

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
      <View style={styles.skeletonStrip} />
      <View style={styles.skeletonContent}>
        <View style={[styles.skeletonLine, { width: '60%', height: 16, marginBottom: 8 }]} />
        <View style={[styles.skeletonLine, { width: '40%', height: 12, marginBottom: 16 }]} />
        <View style={[styles.skeletonLine, { width: '80%', height: 12, marginBottom: 6 }]} />
        <View style={[styles.skeletonLine, { width: '50%', height: 12 }]} />
      </View>
    </Animated.View>
  );
}

export default function AppointmentsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getMyAppointments();
      setAppointments(response.data);
    } catch {
      Alert.alert('Hata', 'Randevular yüklenemedi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchAppointments(); }, []));

  const handleAction = async (id: string, action: 'confirm' | 'cancel' | 'complete') => {
    const messages: any = {
      confirm: 'Randevuyu onaylamak istiyor musunuz?',
      cancel: 'Randevuyu iptal etmek istiyor musunuz?',
      complete: 'Randevuyu tamamlamak istiyor musunuz?',
    };
    Alert.alert('Onay', messages[action], [
      { text: 'Hayır', style: 'cancel' },
      {
        text: 'Evet',
        onPress: async () => {
          try {
            if (action === 'confirm') await appointmentService.confirm(id);
            if (action === 'cancel') await appointmentService.cancel(id);
            if (action === 'complete') await appointmentService.complete(id);
            fetchAppointments();
          } catch (error: any) {
            Alert.alert('Hata', error.response?.data?.message || 'İşlem başarısız');
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  const renderItem = ({ item }: any) => {
    const status = STATUS_MAP[item.status] || STATUS_MAP.pending;
    return (
      <View style={[styles.card, SHADOWS.sm]}>
        <View style={[styles.statusStrip, { backgroundColor: status.color }]} />
        <View style={styles.cardInner}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.serviceName}>{item.service_name}</Text>
              <Text style={styles.personName}>
                {user?.role === 'provider' ? item.customer_name : item.provider_name}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Ionicons name={status.icon} size={12} color={COLORS.white} />
              <Text style={styles.statusText}>{status.label}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.infoText}>{formatDate(item.appointment_date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.infoText}>{item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}</Text>
          </View>
          {item.notes ? (
            <View style={styles.infoRow}>
              <Ionicons name="chatbubble-outline" size={14} color={COLORS.textMuted} />
              <Text style={[styles.infoText, { fontStyle: 'italic' }]}>{item.notes}</Text>
            </View>
          ) : null}

          <View style={styles.cardFooter}>
            <Text style={styles.price}>₺{item.total_price}</Text>
            <View style={styles.actions}>
              {user?.role === 'provider' && item.status === 'pending' && (
                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: COLORS.success + '15' }]}
                  onPress={() => handleAction(item.id, 'confirm')}
                >
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
                </TouchableOpacity>
              )}
              {user?.role === 'provider' && item.status === 'confirmed' && (
                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: COLORS.completed + '15' }]}
                  onPress={() => handleAction(item.id, 'complete')}
                >
                  <Ionicons name="checkmark-done-circle" size={22} color={COLORS.completed} />
                </TouchableOpacity>
              )}
              {item.status !== 'cancelled' && item.status !== 'completed' && (
                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: COLORS.danger + '15' }]}
                  onPress={() => handleAction(item.id, 'cancel')}
                >
                  <Ionicons name="close-circle" size={22} color={COLORS.danger} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Randevularım</Text>
        <Text style={styles.pageCount}>{appointments.length} randevu</Text>
      </View>
      {loading ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(i) => String(i)}
          renderItem={() => <SkeletonCard />}
          contentContainerStyle={styles.list}
        />
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchAppointments(); }}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="calendar-outline" size={48} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>Henüz randevunuz yok</Text>
              <Text style={styles.emptySubtitle}>Randevu almak için Kuaförler sekmesini ziyaret edin</Text>
              {user?.role === 'customer' && (
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate('Providers')}
                >
                  <Text style={styles.emptyBtnText}>Randevu Al</Text>
                </TouchableOpacity>
              )}
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
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.textPrimary },
  pageCount: { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textMuted },
  list: { padding: SIZES.padding, paddingBottom: 100 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  statusStrip: { width: 4 },
  cardInner: { flex: 1, padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardHeaderLeft: { flex: 1, marginRight: 8 },
  serviceName: { fontFamily: FONTS.semiBold, fontSize: SIZES.lg, color: COLORS.textPrimary },
  personName: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
  },
  statusText: { fontFamily: FONTS.semiBold, fontSize: 10, color: COLORS.white },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  infoText: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  price: { fontFamily: FONTS.bold, fontSize: SIZES.xl, color: COLORS.primary },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIconBox: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: COLORS.primary + '12',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: SIZES.xl, color: COLORS.textPrimary, textAlign: 'center' },
  emptySubtitle: { fontFamily: FONTS.regular, fontSize: SIZES.md, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
  emptyBtn: {
    marginTop: 24, backgroundColor: COLORS.primary,
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: SIZES.radiusLg,
  },
  emptyBtnText: { fontFamily: FONTS.semiBold, color: COLORS.white, fontSize: SIZES.md },

  skeletonCard: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radiusLg,
    marginBottom: 12, overflow: 'hidden', flexDirection: 'row',
  },
  skeletonStrip: { width: 4, backgroundColor: COLORS.border },
  skeletonContent: { flex: 1, padding: 14 },
  skeletonLine: { backgroundColor: COLORS.border, borderRadius: 4 },
});
