import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, StatusBar, Platform, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { COLORS, SIZES, FONTS, GRADIENTS, SHADOWS } from '../constants/theme';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Hata', 'E-posta adresi zorunludur');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      Alert.alert('Başarılı', 'Sıfırlama kodu e-posta adresinize gönderildi');
      setStep(2);
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.message || 'Kod gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword) {
      Alert.alert('Hata', 'Kod ve yeni şifre zorunludur');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, code, new_password: newPassword });
      Alert.alert('Başarılı', 'Şifreniz güncellendi. Giriş yapabilirsiniz.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.message || 'Şifre güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <LinearGradient
        colors={GRADIENTS.primaryDark}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.iconCircle}>
          <Ionicons name="key" size={36} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Şifremi Unuttum</Text>
        <Text style={styles.subtitle}>
          {step === 1 ? 'E-posta adresinize kod göndereceğiz' : '6 haneli kodu girin'}
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {step === 1 ? (
              <>
                <Text style={styles.label}>E-posta Adresi</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="ornek@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.btnWrap, loading && { opacity: 0.7 }]}
                  onPress={handleSendCode}
                  disabled={loading}
                >
                  <LinearGradient colors={GRADIENTS.primaryDark} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    {loading ? <ActivityIndicator color={COLORS.white} /> : (
                      <Text style={styles.btnText}>Kod Gönder</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.label}>Sıfırlama Kodu</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="keypad-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="6 haneli kod"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                <Text style={styles.label}>Yeni Şifre</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="En az 6 karakter"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.btnWrap, loading && { opacity: 0.7 }]}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  <LinearGradient colors={GRADIENTS.primaryDark} style={styles.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    {loading ? <ActivityIndicator color={COLORS.white} /> : (
                      <Text style={styles.btnText}>Şifreyi Güncelle</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setStep(1)} style={styles.resendBtn}>
                  <Text style={styles.resendText}>Tekrar kod gönder</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 50,
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 44,
    left: 16, width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14, ...SHADOWS.lg,
  },
  title: { fontFamily: FONTS.bold, fontSize: 26, color: COLORS.white },
  subtitle: { fontFamily: FONTS.regular, fontSize: SIZES.md, color: 'rgba(255,255,255,0.75)', marginTop: 4, textAlign: 'center' },
  scrollContent: { paddingBottom: 40, marginTop: -24 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusXl,
    marginHorizontal: 16, padding: 24,
    ...SHADOWS.md,
  },
  label: {
    fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textSecondary,
    letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 6, marginTop: 14,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: SIZES.radius,
    backgroundColor: COLORS.surfaceSecondary, paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1, paddingVertical: 13, fontSize: SIZES.md,
    fontFamily: FONTS.regular, color: COLORS.textPrimary,
  },
  btnWrap: { borderRadius: SIZES.radius, marginTop: 24, overflow: 'hidden', ...SHADOWS.lg },
  btn: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: FONTS.bold, color: COLORS.white, fontSize: SIZES.lg, letterSpacing: 0.5 },
  resendBtn: { alignItems: 'center', marginTop: 16 },
  resendText: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.primary },
});
