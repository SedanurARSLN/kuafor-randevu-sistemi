import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Share, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { providerAppointmentService } from '../services/providerAppointmentService';
import { COLORS, SIZES, FONTS, GRADIENTS, SHADOWS } from '../constants/theme';

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
  const statsErrorShown = useRef(false);
  const earningsErrorShown = useRef(false);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
      if (isProvider) fetchEarnings();
      return () => {
        // Reset flags so a fresh visit can show error alerts again
        statsErrorShown.current = false;
        earningsErrorShown.current = false;
      };
    }, [isProvider])
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
    } catch (error: any) {
      if (__DEV__) console.warn('[HomeScreen] fetchStats error:', error?.message ?? error);
      if (!statsErrorShown.current) {
        statsErrorShown.current = true;
        const msg = error?.response?.data?.message || 'İstatistikler yüklenemedi';
        Alert.alert('Uyarı', msg);
      }
    }
  };

  const fetchEarnings = async () => {
    try {
      const data = await providerAppointmentService.getEarnings();
      setEarnings(data);
    } catch (error: any) {
      if (__DEV__) console.warn('[HomeScreen] fetchEarnings error:', error?.message ?? error);
      if (!earningsErrorShown.current) {
        earningsErrorShown.current = true;
        const msg = error?.response?.data?.message || 'Kazanç bilgileri yüklenemedi';
        Alert.alert('Uyarı', msg);
      }
    }
  };

  const handleShareLink = async () => {
    try {
      const bookingUrl = `https://kuafor-randevu-sistemi-3shp.onrender.com/api/auth/book/${user?.id}`;
      await Share.share({ message: bookingUrl });
    } catch { /* silent */ }
  };

  const currentEarning = earnings[activePeriod];
  const firstName = user?.full_name?.split(' ')[0] ?? '';

  const statCards = [
    { num: stats.total, label: 'Toplam', color: COLORS.primary, bg: '#EFF6FF' },
    { num: stats.pending, label: 'Bekleyen', color: COLORS.pending, bg: '#FFF7ED' },
    { num: stats.confirmed, label: 'Onaylı', color: COLORS.success, bg: '#F0FDF4' },
    { num: stats.completed, label: 'Biten', color: COLORS.completed, bg: '#EEF2FF' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={GRADIENTS.primary}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Merhaba,</Text>
              <Text style={styles.name}>{firstName}</Text>
            </View>
            <View style={styles.roleBadge}>
              <Ionicons name={isProvider ? 'cut' : 'person'} size={14} color={COLORS.white} />
              <Text style={styles.roleText}>{isProvider ? 'Kuaför' : 'Müşteri'}</Text>
            </View>
          </View>
          <Text style={styles.headerSub}>
            {isProvider ? 'İşletmenizi yönetin' : 'Randevunuzu kolayca yönetin'}
          </Text>
        </LinearGradient>

        <View style={styles.body}>
          {isProvider ? (
            <>
              {/* Earnings Card */}
              <View style={[styles.earningsCard, SHADOWS.md]}>
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
                <Text style={styles.earningsLabel}>Toplam Kazanç</Text>
                <Text style={styles.earningsAmount}>
                  ₺{currentEarning.total.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
                </Text>
                <Text style={styles.earningsSubtext}>{currentEarning.count} randevu tamamlandı</Text>
              </View>

              {/* Provider stats */}
              <View style={styles.providerStatsRow}>
                <View style={[styles.providerStatCard, { borderTopColor: COLORS.pending }]}>
                  <Text style={[styles.providerStatNum, { color: COLORS.pending }]}>{stats.pending}</Text>
                  <Text style={styles.providerStatLabel}>Bekleyen</Text>
                </View>
                <View style={[styles.providerStatCard, { borderTopColor: COLORS.success }]}>
                  <Text style={[styles.providerStatNum, { color: COLORS.success }]}>{stats.confirmed}</Text>
                  <Text style={styles.providerStatLabel}>Onaylı</Text>
                </View>
              </View>
            </>
          ) : (
            /* Customer stats */
            <View style={styles.statsRow}>
              {statCards.map((s) => (
                <View key={s.label} style={[styles.statCard, { borderTopColor: s.color }]}>
                  <Text style={[styles.statNum, { color: s.color }]}>{s.num}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Quick Access */}
          <Text style={styles.sectionTitle}>Hızlı Erişim</Text>

          {!isProvider ? (
            <>
              <QuickCard
                icon="cut"
                title="Randevu Al"
                desc="Kuaför seçip randevu oluşturun"
                onPress={() => navigation.navigate('Providers')}
                accent={COLORS.primary}
              />
              <QuickCard
                icon="calendar"
                title="Randevularım"
                desc="Tüm randevularınızı görün"
                onPress={() => navigation.navigate('Appointments')}
                accent={COLORS.completed}
              />
            </>
          ) : (
            <>
              <QuickCard
                icon="share-social"
                title="Randevu Linki Paylaş"
                desc="WhatsApp / SMS ile müşteriye gönderin"
                onPress={handleShareLink}
                accent={COLORS.success}
              />
              <QuickCard
                icon="calendar"
                title="Gelen Randevular"
                desc="Randevuları yönetin"
                onPress={() => navigation.navigate('Appointments')}
                accent={COLORS.primary}
              />
              <QuickCard
                icon="cut"
                title="Hizmetlerim"
                desc="Hizmet ekle ve düzenle"
                onPress={() => navigation.navigate('MyServices')}
                accent={COLORS.secondary}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function QuickCard({ icon, title, desc, onPress, accent }: any) {
  return (
    <TouchableOpacity style={styles.quickCard} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.quickIconBox, { backgroundColor: accent + '18' }]}>
        <Ionicons name={icon} size={22} color={accent} />
      </View>
      <View style={styles.quickContent}>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={styles.quickDesc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 100 },

  header: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 56,
    paddingBottom: 32,
    paddingHorizontal: SIZES.padding,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontFamily: FONTS.regular, fontSize: SIZES.md, color: 'rgba(255,255,255,0.8)' },
  name: { fontFamily: FONTS.bold, fontSize: 26, color: COLORS.white, marginTop: 2 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.white },
  headerSub: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: 'rgba(255,255,255,0.7)', marginTop: 8 },

  body: { padding: SIZES.padding },

  earningsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: 20,
    marginBottom: 12,
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
  },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  periodBtnActive: { backgroundColor: COLORS.primary },
  periodText: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textMuted },
  periodTextActive: { color: COLORS.white },
  earningsLabel: { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textMuted, textAlign: 'center' },
  earningsAmount: { fontFamily: FONTS.bold, fontSize: 40, color: COLORS.textPrimary, textAlign: 'center', marginTop: 4 },
  earningsSubtext: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4 },

  providerStatsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  providerStatCard: {
    flex: 1, borderRadius: SIZES.radius, paddingVertical: 16,
    alignItems: 'center', backgroundColor: COLORS.white,
    borderTopWidth: 4, ...SHADOWS.sm,
  },
  providerStatNum: { fontFamily: FONTS.bold, fontSize: 26 },
  providerStatLabel: { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statCard: {
    flex: 1, borderRadius: SIZES.radius, padding: 12, alignItems: 'center',
    backgroundColor: COLORS.white, borderTopWidth: 4, ...SHADOWS.sm,
  },
  statNum: { fontFamily: FONTS.bold, fontSize: 22 },
  statLabel: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 4 },

  sectionTitle: {
    fontFamily: FONTS.semiBold, fontSize: SIZES.md,
    color: COLORS.textSecondary, letterSpacing: 0.5,
    textTransform: 'uppercase', marginBottom: 12,
  },
  quickCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: SIZES.radiusLg,
    padding: 16, marginBottom: 10, ...SHADOWS.sm,
  },
  quickIconBox: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  quickContent: { flex: 1 },
  quickTitle: { fontFamily: FONTS.semiBold, fontSize: SIZES.md, color: COLORS.textPrimary },
  quickDesc: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
});
