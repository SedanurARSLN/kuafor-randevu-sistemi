import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { providerAppointmentService } from '../services/providerAppointmentService';
import { appointmentService } from '../services/appointmentService';
import { COLORS, SIZES, FONTS, GRADIENTS, SHADOWS } from '../constants/theme';

type EarningsPeriod = 'daily' | 'weekly' | 'monthly';

const periodLabels: Record<EarningsPeriod, string> = {
  daily: 'Bugün',
  weekly: 'Bu Hafta',
  monthly: 'Bu Ay',
};

interface Earnings {
  daily:   { total: number; count: number };
  weekly:  { total: number; count: number };
  monthly: { total: number; count: number };
}

interface Appointment {
  id: string;
  customer_name: string;
  service_names: string[] | string;
  appointment_date: string;
  start_time: string;
  total_price: number | string;
  status: string;
}

export default function ProviderEarningsScreen({ navigation }: any) {
  const [earnings, setEarnings] = useState<Earnings>({
    daily:   { total: 0, count: 0 },
    weekly:  { total: 0, count: 0 },
    monthly: { total: 0, count: 0 },
  });
  const [activePeriod, setActivePeriod] = useState<EarningsPeriod>('monthly');
  const [completedList, setCompletedList] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [earningsData, appointmentsResp] = await Promise.all([
        providerAppointmentService.getEarnings(),
        appointmentService.getMyAppointments(),
      ]);
      setEarnings(earningsData);
      const completed: Appointment[] = (appointmentsResp.data as Appointment[])
        .filter((a) => a.status === 'completed')
        .sort((a, b) =>
          new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
        );
      setCompletedList(completed);
    } catch {
      Alert.alert('Hata', 'Kazanç bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const currentEarning = earnings[activePeriod];

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const formatServiceNames = (names: string[] | string): string => {
    if (Array.isArray(names)) return names.join(', ');
    return names ?? 'Hizmet';
  };

  const formatAmount = (price: number | string) =>
    Number(price).toLocaleString('tr-TR', { minimumFractionDigits: 0 });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* ── Gradient Header ── */}
      <LinearGradient
        colors={GRADIENTS.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>Kazançlarım</Text>
          <Text style={styles.headerSub}>Tamamlanan randevularınızın özeti</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="wallet-outline" size={28} color="rgba(255,255,255,0.6)" />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Kazanç Özet Kartı ── */}
          <View style={[styles.earningsCard, SHADOWS.md]}>
            {/* Dönem Seçici */}
            <View style={styles.periodRow}>
              {(['daily', 'weekly', 'monthly'] as EarningsPeriod[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.periodBtn, activePeriod === p && styles.periodBtnActive]}
                  onPress={() => setActivePeriod(p)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.periodText, activePeriod === p && styles.periodTextActive]}>
                    {periodLabels[p]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Ana tutar */}
            <Text style={styles.earningsLabel}>Toplam Kazanç</Text>
            <Text style={styles.earningsAmount}>₺{formatAmount(currentEarning.total)}</Text>
            <Text style={styles.earningsSubtext}>
              {currentEarning.count} randevu tamamlandı
            </Text>

            {/* Alt istatistik şeridi */}
            <View style={styles.miniStatsRow}>
              {(['daily', 'weekly', 'monthly'] as EarningsPeriod[]).map((p, i) => (
                <React.Fragment key={p}>
                  {i > 0 && <View style={styles.miniDivider} />}
                  <View style={styles.miniStat}>
                    <Text style={styles.miniStatAmount}>₺{formatAmount(earnings[p].total)}</Text>
                    <Text style={styles.miniStatLabel}>{periodLabels[p]}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* ── Tamamlanan Randevular Listesi ── */}
          <Text style={styles.sectionTitle}>Tamamlanan Randevular</Text>

          {completedList.length === 0 ? (
            <View style={[styles.emptyBox, SHADOWS.sm]}>
              <Ionicons name="receipt-outline" size={44} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Henüz tamamlanmış randevu yok</Text>
              <Text style={styles.emptyDesc}>
                Onaylanan randevuları tamamladıkça burada görünecek.
              </Text>
            </View>
          ) : (
            completedList.map((item) => (
              <View key={item.id} style={[styles.listItem, SHADOWS.sm]}>
                <View style={styles.listIconBox}>
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
                </View>
                <View style={styles.listContent}>
                  <Text style={styles.listName}>{item.customer_name ?? 'Müşteri'}</Text>
                  <Text style={styles.listService} numberOfLines={1}>
                    {formatServiceNames(item.service_names)}
                  </Text>
                  <Text style={styles.listDate}>
                    {formatDate(item.appointment_date)} · {item.start_time?.slice(0, 5)}
                  </Text>
                </View>
                <View style={styles.listAmountBox}>
                  <Text style={styles.listAmount}>₺{formatAmount(item.total_price)}</Text>
                  <Text style={styles.listAmountLabel}>kazanıldı</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // ── Header
  header: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 52,
    paddingBottom: 28,
    paddingHorizontal: SIZES.padding,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextBlock: { flex: 1 },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.xl,
    color: COLORS.white,
  },
  headerSub: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  headerIcon: { marginLeft: 8 },

  // ── Layout
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: SIZES.padding, paddingBottom: 110 },

  // ── Earnings Card
  earningsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: 20,
    marginBottom: 24,
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodBtnActive: { backgroundColor: COLORS.primary },
  periodText: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
  },
  periodTextActive: { color: COLORS.white },
  earningsLabel: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  earningsAmount: {
    fontFamily: FONTS.bold,
    fontSize: 42,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 4,
  },
  earningsSubtext: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },

  // Mini stats strip
  miniStatsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  miniStat: { flex: 1, alignItems: 'center' },
  miniDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  miniStatAmount: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.md,
    color: COLORS.primary,
  },
  miniStatLabel: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // ── Section title
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // ── Empty state
  emptyBox: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  emptyDesc: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },

  // ── List item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: 14,
    marginBottom: 10,
  },
  listIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listContent: { flex: 1 },
  listName: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },
  listService: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  listDate: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  listAmountBox: { alignItems: 'flex-end' },
  listAmount: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.lg,
    color: COLORS.success,
  },
  listAmountLabel: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
