import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES } from '../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Çıkış', 'Çıkış yapmak istiyor musunuz?', [
      { text: 'Hayır', style: 'cancel' },
      { text: 'Evet', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.full_name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.full_name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role === 'provider' ? '💈 Kuaför' : '👤 Müşteri'}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>📋 Hesap Bilgileri</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📧 Email</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📞 Telefon</Text>
          <Text style={styles.infoValue}>{user?.phone || 'Belirtilmemiş'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>👤 Hesap Türü</Text>
          <Text style={styles.infoValue}>
            {user?.role === 'provider' ? 'Kuaför' : 'Müşteri'}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>ℹ️ Uygulama Hakkında</Text>
        <Text style={styles.aboutText}>Kuaför Randevu Sistemi v1.0</Text>
        <Text style={styles.aboutDesc}>
          Online kuaför randevu alma ve yönetim uygulaması.
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding, paddingBottom: 40 },
  avatarContainer: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { color: COLORS.white, fontSize: 36, fontWeight: 'bold' },
  name: { fontSize: SIZES.xxl, fontWeight: 'bold', color: COLORS.black },
  roleBadge: {
    backgroundColor: COLORS.primary + '20', paddingHorizontal: 14,
    paddingVertical: 6, borderRadius: 20, marginTop: 8,
  },
  roleText: { color: COLORS.primary, fontWeight: '600', fontSize: SIZES.md },
  infoCard: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radius,
    padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: SIZES.xl, fontWeight: 'bold', color: COLORS.black, marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { fontSize: SIZES.md, color: COLORS.gray },
  infoValue: { fontSize: SIZES.md, color: COLORS.black, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.lightGray },
  aboutText: { fontSize: SIZES.lg, fontWeight: '600', color: COLORS.black },
  aboutDesc: { fontSize: SIZES.md, color: COLORS.gray, marginTop: 6 },
  logoutButton: {
    backgroundColor: COLORS.danger, borderRadius: SIZES.radius,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  logoutText: { color: COLORS.white, fontSize: SIZES.lg, fontWeight: 'bold' },
});