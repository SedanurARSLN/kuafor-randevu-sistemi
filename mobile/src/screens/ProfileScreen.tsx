import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { COLORS, SIZES } from '../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Cikis', 'Cikis yapmak istiyor musunuz?', [
      { text: 'Hayir', style: 'cancel' },
      { text: 'Evet', onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabi Sil',
      'Hesabiniz ve tum verileriniz kalici olarak silinecek. Bu islem geri alinamaz. Devam etmek istiyor musunuz?',
      [
        { text: 'Vazgec', style: 'cancel' },
        {
          text: 'Hesabimi Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('/auth/account');
              await logout();
            } catch (error: any) {
              Alert.alert('Hata', error.response?.data?.message || 'Hesap silinemedi');
            }
          },
        },
      ]
    );
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
            {user?.role === 'provider' ? 'Kuafor' : 'Musteri'}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Telefon</Text>
          <Text style={styles.infoValue}>{user?.phone || 'Belirtilmemiş'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Hesap Turu</Text>
          <Text style={styles.infoValue}>
            {user?.role === 'provider' ? 'Kuaför' : 'Müşteri'}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Uygulama Hakkinda</Text>
        <Text style={styles.aboutText}>Kuaför Randevu Sistemi v1.0</Text>
        <Text style={styles.aboutDesc}>
          Online kuaför randevu alma ve yönetim uygulaması.
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cikis Yap</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Text style={styles.deleteText}>Hesabimi Sil</Text>
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
  deleteButton: {
    backgroundColor: 'transparent', borderRadius: SIZES.radius,
    padding: 16, alignItems: 'center', marginTop: 12,
    borderWidth: 1, borderColor: COLORS.danger,
  },
  deleteText: { color: COLORS.danger, fontSize: SIZES.md, fontWeight: '600' },
});