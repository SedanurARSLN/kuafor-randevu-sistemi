import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES, FONTS, GRADIENTS, SHADOWS } from '../constants/theme';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [role, setRole] = useState<'customer' | 'provider'>('customer');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 4 && digits.length <= 7) {
      formatted = `${digits.slice(0, 4)} ${digits.slice(4)}`;
    } else if (digits.length > 7 && digits.length <= 9) {
      formatted = `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    } else if (digits.length > 9) {
      formatted = `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
    }
    setPhone(formatted);
  };

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleRegister = async () => {
    if (!fullName || !email || !phone || !password) {
      Alert.alert('Hata', 'Tüm alanlar zorunludur');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin');
      return;
    }
    if (password.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalıdır');
      return;
    } else {
      setPasswordError('');
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 11) {
      Alert.alert('Hata', 'Telefon numarasını 11 haneli olarak girin');
      return;
    }
    setLoading(true);
    try {
      await register({ full_name: fullName, email, phone: phoneDigits, password, role });
    } catch (error: any) {
      const apiData = error.response?.data;
      const baseMessage = apiData?.message || 'Kayıt başarısız';
      const fieldErrors = Array.isArray(apiData?.errors)
        ? apiData.errors.map((e: any) => `• ${e.message}`).join('\n')
        : '';
      Alert.alert('Hata', fieldErrors ? `${baseMessage}\n\n${fieldErrors}` : baseMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <LinearGradient
        colors={GRADIENTS.primaryDark}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.iconCircle}>
          <Ionicons name="person-add" size={36} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Kayıt Ol</Text>
        <Text style={styles.subtitle}>Yeni hesap oluşturun</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Hesap Türü</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleCard, role === 'customer' && styles.roleCardActive]}
                onPress={() => setRole('customer')}
                activeOpacity={0.8}
              >
                <View style={[styles.roleIconBox, role === 'customer' && styles.roleIconBoxActive]}>
                  <Ionicons name="person" size={28} color={role === 'customer' ? COLORS.white : COLORS.textMuted} />
                </View>
                <Text style={[styles.roleCardTitle, role === 'customer' && styles.roleCardTitleActive]}>Müşteri</Text>
                <Text style={[styles.roleCardSub, role === 'customer' && styles.roleCardSubActive]}>Randevu alın</Text>
                {role === 'customer' && (
                  <View style={styles.roleCheck}>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleCard, role === 'provider' && styles.roleCardActive]}
                onPress={() => setRole('provider')}
                activeOpacity={0.8}
              >
                <View style={[styles.roleIconBox, role === 'provider' && styles.roleIconBoxActive]}>
                  <Ionicons name="cut" size={28} color={role === 'provider' ? COLORS.white : COLORS.textMuted} />
                </View>
                <Text style={[styles.roleCardTitle, role === 'provider' && styles.roleCardTitleActive]}>Kuaför</Text>
                <Text style={[styles.roleCardSub, role === 'provider' && styles.roleCardSubActive]}>Randevu yönetin</Text>
                {role === 'provider' && (
                  <View style={styles.roleCheck}>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ad Soyad</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Adınız Soyadınız"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
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
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefon</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="05XX XXX XX XX"
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  placeholderTextColor={COLORS.textMuted}
                  maxLength={14}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (text.length >= 6) setPasswordError('');
                  }}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={COLORS.textMuted}
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            <TouchableOpacity
              style={[styles.buttonWrapper, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={GRADIENTS.primaryDark}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.buttonText}>Kayıt Ol</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
              <Text style={styles.linkText}>
                Zaten hesabınız var mı?{'  '}
                <Text style={styles.linkBold}>Giriş Yap</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.background },
  gradientHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 50,
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 44,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    ...SHADOWS.lg,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: COLORS.white,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.md,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  scrollContent: { paddingBottom: 40, marginTop: -24 },
  card: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    borderRadius: SIZES.radiusXl,
    marginHorizontal: 16,
    padding: 24,
    ...SHADOWS.md,
  },
  sectionLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  roleContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusLg,
    padding: 16,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    position: 'relative',
  },
  roleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  roleIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  roleIconBoxActive: { backgroundColor: COLORS.primary },
  roleCardTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  roleCardTitleActive: { color: COLORS.primary },
  roleCardSub: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  roleCardSubActive: { color: COLORS.primary },
  roleCheck: { position: 'absolute', top: 8, right: 8 },
  inputGroup: { marginBottom: 14 },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  eyeButton: { padding: 4 },
  buttonWrapper: {
    borderRadius: SIZES.radius,
    marginTop: 24,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  buttonDisabled: { opacity: 0.7 },
  button: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: FONTS.bold, color: COLORS.white, fontSize: SIZES.lg, letterSpacing: 0.5 },
  linkButton: { alignItems: 'center', marginTop: 18, paddingVertical: 4 },
  linkText: { fontFamily: FONTS.regular, fontSize: SIZES.md, color: COLORS.textSecondary },
  linkBold: { fontFamily: FONTS.bold, color: COLORS.primary },
  errorText: { fontFamily: FONTS.regular, color: COLORS.danger, fontSize: SIZES.sm, marginTop: 4 },
});
