import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { providerAppointmentService } from '../services/providerAppointmentService';
import { COLORS, SIZES } from '../constants/theme';

type EarningsPeriod = 'daily' | 'weekly' | 'monthly';

const periodLabels: Record<EarningsPeriod, string> = {
  daily: 'Bugün',
  weekly: 'Bu Hafta',
  monthly: 'Bu Ay',
};

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const isProvider = user?.role === 'provider';

  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0 });
  const [earnings, setEarnings] = useState({
    daily:   { total: 0, count: 0 },
    weekly:  { total: 0, count: 0 },
    monthly: { total: 0, count: 0 },
  });
  const [activePeriod, setActivePeriod] = useState<EarningsPeriod>('daily');

  useFocusEffect(
    useCallback(() => {
      fetchStats();
      if (isProvider) fetchEarnings();
    }, [])
  );

  const fetchStats = async () => {
    try {
      const response = await appointmentService.getMyAppointments();
      const appointments = response.data;
      setStats({
        total: appointments.length,
        pending:   appointments.filter((a: any) => a.status === 'pending').length,
        confirmed: appointments.filter((a: any) => a.status === 'confirmed').length,
        completed: appointments.filter((a: any) => a.status === 'completed').length,
      });
    } catch {
      // silent fail
    }
  };

  const fetchEarnings = async () => {
    try {
      const data = await providerAppointmentService.getEarnings();
      setEarnings(data);
    } catch {
      // silent fail
    }
  };

  const handleShareLink = async () => {
    try {
      const bookingUrl = `https://kuafor-randevu-sistemi-3shp.onrender.com/api/auth/book/${user?.id}`;
      await Share.share({ message: bookingUrl });
    } catch {
      // silent fail
    }
  };

  const currentEarning = earnings[activePeriod];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Merhaba,</Text>
        <Text style={styles.name}>{user?.full_name}</Text>
        <Text style={styles.role}>
          {isProvider ? 'Kuafor' : 'Musteri'}
        </Text>
      </View>

      {isProvider ? (
        <>
          {/* ════ KUAFÖR: Kazanç Kartı ════ */}
          <View style={styles.earningsCard}>
            {/* Dönem Seçici */}
            <View style={styles.periodRow}>
              {(['daily', 'weekly', 'monthly'] as EarningsPeriod[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.periodBtn, activePeriod === p && styles.periodBtnActive]}
                  onPress={() => setActivePeriod(p)}
                >
                  <Text style={[styles.periodText, activePeriod === p && styles.periodTextActive]}>
                    {periodLabels[p]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Ana Kazanç */}
            <Text style={styles.earningsAmount}>
              ₺{currentEarning.total.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
            <Text style={styles.earningsSubtext}>
              {currentEarning.count} randevu tamamlandı
            </Text>
          </View>

          {/* ════ KUAFÖR: Kompakt İstatistikler ════ */}
          <View style={styles.providerStatsRow}>
            <View style={[styles.providerStatCard, { backgroundColor: '#FFF7ED' }]}>
              <Text style={[styles.providerStatNum, { color: COLORS.pending }]}>{stats.pending}</Text>
              <Text style={styles.providerStatLabel}>Bekleyen</Text>
            </View>
            <View style={[styles.providerStatCard, { backgroundColor: '#F0FDF4' }]}>
              <Text style={[styles.providerStatNum, { color: COLORS.success }]}>{stats.confirmed}</Text>
              <Text style={styles.providerStatLabel}>Onaylı</Text>
            </View>
          </View>
        </>
      ) : (
        <>
          {/* ════ MÜŞTERİ: İstatistikler (mevcut) ════ */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
              <Text style={styles.statNum}>{stats.total}</Text>
              <Text style={styles.statLabel}>Toplam</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FFF7ED' }]}>
              <Text style={[styles.statNum, { color: COLORS.pending }]}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Bekleyen</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
              <Text style={[styles.statNum, { color: COLORS.success }]}>{stats.confirmed}</Text>
              <Text style={styles.statLabel}>Onaylı</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#EEF2FF' }]}>
              <Text style={[styles.statNum, { color: COLORS.completed }]}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Biten</Text>
            </View>
          </View>
        </>
      )}

      {/* ════ Hızlı Erişim ════ */}
      <Text style={styles.sectionTitle}>Hizli Erisim</Text>

      {!isProvider ? (
        <>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Providers')}>
            <Ionicons name="cut" size={32} color={COLORS.primary} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Randevu Al</Text>
              <Text style={styles.cardDesc}>Kuafor secip randevu olusturun</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={COLORS.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Appointments')}>
            <Ionicons name="calendar" size={32} color={COLORS.primary} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Randevularim</Text>
              <Text style={styles.cardDesc}>Tum randevularinizi gorun</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={COLORS.gray} />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity style={styles.shareCard} onPress={handleShareLink}>
            <Ionicons name="share-social" size={32} color={COLORS.success} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Randevu Linki Paylas</Text>
              <Text style={styles.cardDesc}>WhatsApp / SMS ile musteriye gonderin</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={COLORS.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Appointments')}>
            <Ionicons name="calendar" size={32} color={COLORS.primary} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Gelen Randevular</Text>
              <Text style={styles.cardDesc}>Randevulari yonetin</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={COLORS.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MyServices')}>
            <Ionicons name="cut" size={32} color={COLORS.primary} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Hizmetlerim</Text>
              <Text style={styles.cardDesc}>Hizmet ekle ve duzenle</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={COLORS.gray} />
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding },

  // ── Header
  header: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius,
    padding: 24, marginBottom: 20,
  },
  greeting: { fontSize: SIZES.lg, color: 'rgba(255,255,255,0.8)' },
  name: { fontSize: SIZES.xxl, fontWeight: 'bold', color: COLORS.white, marginTop: 4 },
  role: { fontSize: SIZES.md, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  // ── Kuaför: Kazanç Kartı
  earningsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 3,
    marginBottom: 16,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  periodBtnActive: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray,
  },
  periodTextActive: {
    color: COLORS.white,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
  },
  earningsSubtext: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 4,
  },

  // ── Kuaför: Kompakt İstatistikler (2 kart)
  providerStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  providerStatCard: {
    flex: 1,
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  providerStatNum: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  providerStatLabel: {
    fontSize: SIZES.md,
    color: COLORS.gray,
  },

  // ── Müşteri: 4'lü İstatistik
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statCard: {
    flex: 1, borderRadius: SIZES.radius, padding: 12, alignItems: 'center',
  },
  statNum: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  statLabel: { fontSize: SIZES.xs, color: COLORS.gray, marginTop: 4 },

  // ── Hızlı Erişim
  sectionTitle: {
    fontSize: SIZES.xl, fontWeight: 'bold', color: COLORS.black, marginBottom: 12,
  },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: SIZES.radius,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  shareCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0FDF4', borderRadius: SIZES.radius,
    padding: 16, marginBottom: 12, borderWidth: 2, borderColor: COLORS.success,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  cardIcon: { fontSize: 36, width: 36, textAlign: 'center' as const },
  cardContent: { flex: 1, marginLeft: 14 },
  cardTitle: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.black },
  cardDesc: { fontSize: SIZES.md, color: COLORS.gray, marginTop: 2 },
  arrow: { fontSize: 28, color: COLORS.gray },
});
