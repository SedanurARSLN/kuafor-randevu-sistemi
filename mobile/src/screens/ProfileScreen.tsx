import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { COLORS, SIZES, FONTS, GRADIENTS, SHADOWS } from '../constants/theme';

type InfoRowProps = { icon: keyof typeof Ionicons.glyphMap; label: string; value: string };
function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Çıkış', 'Çıkış yapmak istiyor musunuz?', [
      { text: 'Hayır', style: 'cancel' },
      { text: 'Evet', onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınız ve tüm verileriniz kalıcı olarak silinecek. Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Hesabımı Sil',
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

  const initials = user?.full_name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() ?? '?';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Gradient Header */}
        <LinearGradient
          colors={GRADIENTS.primaryDark}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.full_name}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name={user?.role === 'provider' ? 'cut' : 'person'} size={12} color={COLORS.white} />
            <Text style={styles.roleText}>{user?.role === 'provider' ? 'Kuaför' : 'Müşteri'}</Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Info Card */}
          <View style={[styles.card, SHADOWS.sm]}>
            <Text style={styles.cardTitle}>Hesap Bilgileri</Text>
            <InfoRow icon="mail-outline" label="Email" value={user?.email ?? ''} />
            <View style={styles.divider} />
            <InfoRow icon="call-outline" label="Telefon" value={user?.phone || 'Belirtilmemiş'} />
            <View style={styles.divider} />
            <InfoRow
              icon="person-circle-outline"
              label="Hesap Türü"
              value={user?.role === 'provider' ? 'Kuaför' : 'Müşteri'}
            />
          </View>

          {/* About Card */}
          <View style={[styles.card, SHADOWS.sm]}>
            <Text style={styles.cardTitle}>Uygulama Hakkında</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Versiyon</Text>
                <Text style={styles.infoValue}>Kuaför Randevu v1.0</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Gizlilik</Text>
                <Text style={styles.infoValue}>Online randevu yönetim sistemi</Text>
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} activeOpacity={0.85}>
            <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
            <Text style={styles.deleteText}>Hesabımı Sil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 100 },

  header: {
    paddingTop: Platform.OS === 'ios' ? 70 : (StatusBar.currentHeight ?? 0) + 24,
    paddingBottom: 36,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    ...SHADOWS.md,
  },
  avatarText: { fontFamily: FONTS.bold, fontSize: 36, color: COLORS.white },
  name: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.white },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, marginTop: 8,
  },
  roleText: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.white },

  body: { padding: SIZES.padding },
  card: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radiusLg,
    padding: 20, marginBottom: 14,
  },
  cardTitle: { fontFamily: FONTS.semiBold, fontSize: SIZES.md, color: COLORS.textSecondary, marginBottom: 16, letterSpacing: 0.3, textTransform: 'uppercase' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  infoIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  infoText: { flex: 1 },
  infoLabel: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textMuted },
  infoValue: { fontFamily: FONTS.semiBold, fontSize: SIZES.md, color: COLORS.textPrimary, marginTop: 1 },
  divider: { height: 1, backgroundColor: COLORS.border, marginLeft: 54 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.white, borderRadius: SIZES.radiusLg,
    paddingVertical: 16, marginBottom: 10,
    borderWidth: 1.5, borderColor: COLORS.danger,
    ...SHADOWS.sm,
  },
  logoutText: { fontFamily: FONTS.semiBold, color: COLORS.danger, fontSize: SIZES.lg },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 14,
  },
  deleteText: { fontFamily: FONTS.regular, color: COLORS.danger, fontSize: SIZES.md },
});
