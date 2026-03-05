import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Share,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { COLORS, SIZES } from '../constants/theme';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0 });

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const fetchStats = async () => {
    try {
      const response = await appointmentService.getMyAppointments();
      const appointments = response.data;
      setStats({
        total: appointments.length,
        pending: appointments.filter((a: any) => a.status === 'pending').length,
        confirmed: appointments.filter((a: any) => a.status === 'confirmed').length,
        completed: appointments.filter((a: any) => a.status === 'completed').length,
      });
    } catch (error) {
      console.log('Stats yüklenemedi');
    }
  };

            const handleShareLink = async () => {
    try {
      const bookingUrl = `https://kuafor-randevu-sistemi-3shp.onrender.com/api/auth/book/${user?.id}`;
      await Share.share({
        message: bookingUrl,
      });
    } catch (error) {
      console.log('Paylaşım hatası');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Merhaba 👋</Text>
        <Text style={styles.name}>{user?.full_name}</Text>
        <Text style={styles.role}>
          {user?.role === 'provider' ? '💈 Kuaför' : '👤 Müşteri'}
        </Text>
      </View>

      {/* İstatistikler */}
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

      {/* Hızlı Erişim */}
      <Text style={styles.sectionTitle}>⚡ Hızlı Erişim</Text>

      {user?.role === 'customer' ? (
        <>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Providers')}>
            <Text style={styles.cardIcon}>💈</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Randevu Al</Text>
              <Text style={styles.cardDesc}>Kuaför seçip randevu oluşturun</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Appointments')}>
            <Text style={styles.cardIcon}>📅</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Randevularım</Text>
              <Text style={styles.cardDesc}>Tüm randevularınızı görün</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* 🔗 KUAFÖR LİNK PAYLAŞ */}
          <TouchableOpacity style={styles.shareCard} onPress={handleShareLink}>
            <Text style={styles.cardIcon}>🔗</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Randevu Linki Paylaş</Text>
              <Text style={styles.cardDesc}>WhatsApp / SMS ile müşteriye gönderin</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Appointments')}>
            <Text style={styles.cardIcon}>📅</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Gelen Randevular</Text>
              <Text style={styles.cardDesc}>Randevuları yönetin</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MyServices')}>
            <Text style={styles.cardIcon}>✂️</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Hizmetlerim</Text>
              <Text style={styles.cardDesc}>Hizmet ekle ve düzenle</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding },
  header: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius,
    padding: 24, marginBottom: 20,
  },
  greeting: { fontSize: SIZES.lg, color: 'rgba(255,255,255,0.8)' },
  name: { fontSize: SIZES.xxl, fontWeight: 'bold', color: COLORS.white, marginTop: 4 },
  role: { fontSize: SIZES.md, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statCard: {
    flex: 1, borderRadius: SIZES.radius, padding: 12, alignItems: 'center',
  },
  statNum: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  statLabel: { fontSize: SIZES.xs, color: COLORS.gray, marginTop: 4 },
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
  cardIcon: { fontSize: 36 },
  cardContent: { flex: 1, marginLeft: 14 },
  cardTitle: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.black },
  cardDesc: { fontSize: SIZES.md, color: COLORS.gray, marginTop: 2 },
  arrow: { fontSize: 28, color: COLORS.gray },
});