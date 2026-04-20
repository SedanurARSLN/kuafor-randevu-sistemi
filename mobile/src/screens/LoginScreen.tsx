import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES, FONTS, GRADIENTS, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');

function AnimatedInput({
  icon, placeholder, value, onChangeText, secureTextEntry,
  keyboardType, autoCapitalize, rightElement,
}: any) {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, COLORS.primary],
  });

  return (
    <Animated.View style={[styles.inputWrapper, { borderColor }]}>
      <Ionicons
        name={icon}
        size={18}
        color={focused ? COLORS.primary : COLORS.textMuted}
        style={styles.inputIcon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'none'}
        placeholderTextColor={COLORS.textMuted}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {rightElement}
    </Animated.View>
  );
}

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Eksik Bilgi', 'E-posta ve şifre zorunludur');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin');
      return;
    }
    setLoading(true);
    try {
      await login({ email, password });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Giriş başarısız. Bilgilerinizi kontrol edin.';
      Alert.alert('Giriş Hatası', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Gradient Header - ScrollView İÇİNDE */}
          <LinearGradient
            colors={GRADIENTS.primaryDark}
            style={styles.gradientBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
            <View style={styles.decorCircle3} />

            <View style={styles.brandArea}>
              <View style={styles.iconCircle}>
                <Ionicons name="cut" size={42} color={COLORS.primary} />
              </View>
              <Text style={styles.brandTitle}>Kuaför Randevu</Text>
              <Text style={styles.brandSubtitle}>Randevunuzu kolayca yönetin</Text>
            </View>
          </LinearGradient>

          {/* Beyaz Kart - gradient'in hemen altında */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={styles.titleAccent} />
                <Text style={styles.cardTitle}>Giriş Yap</Text>
              </View>
              <Text style={styles.cardSubtitle}>Hoşgeldiniz, devam etmek için giriş yapın</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-posta Adresi</Text>
              <AnimatedInput
                icon="mail-outline"
                placeholder="ornek@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Şifre</Text>
              <AnimatedInput
                icon="lock-closed-outline"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                rightElement={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                }
              />
            </View>

            <TouchableOpacity
              style={[styles.loginBtnWrap, loading && { opacity: 0.75 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={GRADIENTS.primaryDark}
                style={styles.loginBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <>
                    <Text style={styles.loginBtnText}>Giriş Yap</Text>
                    <Ionicons name="arrow-forward" size={18} color={COLORS.white} style={{ marginLeft: 8 }} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>Şifremi Unuttum</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.85}
            >
              <Ionicons name="person-add-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.registerBtnText}>Yeni Hesap Oluştur</Text>
            </TouchableOpacity>

            <Text style={styles.footerNote}>
              Kayıt olarak{' '}
              <Text
                style={styles.footerLink}
                onPress={() => Linking.openURL('https://kuafor-randevu-sistemi-3shp.onrender.com/privacy-policy')}
              >
                Gizlilik Politikasını
              </Text>
              {' '}kabul etmiş olursunuz.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: {
    flexGrow: 1,
  },

  gradientBg: {
    paddingTop: Platform.OS === 'ios' ? 64 : (StatusBar.currentHeight ?? 0) + 24,
    paddingBottom: 48,
    paddingHorizontal: SIZES.padding,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -70, right: -50,
  },
  decorCircle2: {
    position: 'absolute',
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -30, left: -40,
  },
  decorCircle3: {
    position: 'absolute',
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: 60, left: width * 0.6,
  },
  brandArea: { alignItems: 'center' },
  iconCircle: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: COLORS.white,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 18,
    ...SHADOWS.lg,
  },
  brandTitle: {
    fontFamily: FONTS.bold,
    fontSize: 30,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.md,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 6,
  },

  card: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    flex: 1,
  },

  cardHeader: { marginBottom: 24 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  titleAccent: {
    width: 4, height: 24, borderRadius: 2,
    backgroundColor: COLORS.primary, marginRight: 10,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    marginLeft: 14,
  },

  fieldGroup: { marginBottom: 16 },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusLg,
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  eyeBtn: { padding: 4 },

  loginBtnWrap: {
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    marginTop: 8,
    ...SHADOWS.lg,
  },
  loginBtn: {
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    fontFamily: FONTS.bold,
    color: COLORS.white,
    fontSize: SIZES.lg,
    letterSpacing: 0.5,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    marginHorizontal: 12,
  },

  forgotBtn: { alignSelf: 'flex-end', marginTop: 8, marginBottom: 8 },
  forgotText: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.primary },

  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: SIZES.radiusLg,
    paddingVertical: 14,
    backgroundColor: '#EFF6FF',
  },
  registerBtnText: {
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
    fontSize: SIZES.md,
  },

  footerNote: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 18,
  },
  footerLink: {
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
});
