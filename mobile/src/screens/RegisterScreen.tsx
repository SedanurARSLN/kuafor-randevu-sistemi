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
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES } from '../constants/theme';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [role, setRole] = useState<'customer' | 'provider'>('customer');
  const [loading, setLoading] = useState(false);

  // Telefonu sadece sayısal ve TR formatında (11 hane) tut
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11); // sadece rakam, max 11 hane

    // 05xx xxx xx xx formatına çevir
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

  const handleRegister = async () => {
    if (!fullName || !email || !phone || !password) {
      Alert.alert('Hata', 'Tüm alanlar zorunludur');
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
      console.log('Kayıt hata detay:', error.response?.data);
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.icon}>✂️</Text>
          <Text style={styles.title}>Kayıt Ol</Text>
          <Text style={styles.subtitle}>Yeni hesap oluşturun</Text>
        </View>

        <View style={styles.form}>
        {/* Rol Seçimi */}
        <Text style={styles.label}>Hesap Türü</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'customer' && styles.roleActive]}
            onPress={() => setRole('customer')}
          >
            <Text style={[styles.roleText, role === 'customer' && styles.roleTextActive]}>
              👤 Müşteri
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'provider' && styles.roleActive]}
            onPress={() => setRole('provider')}
          >
            <Text style={[styles.roleText, role === 'provider' && styles.roleTextActive]}>
              💈 Kuaför
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Ad Soyad</Text>
        <TextInput
          style={styles.input}
          placeholder="Adınız Soyadınız"
          value={fullName}
          onChangeText={setFullName}
          placeholderTextColor={COLORS.gray}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="ornek@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={COLORS.gray}
        />

        <Text style={styles.label}>Telefon</Text>
        <TextInput
          style={styles.input}
          placeholder="05XX XXX XX XX"
          value={phone}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          placeholderTextColor={COLORS.gray}
          maxLength={14} // 11 rakam + 3 boşluk (05XX XXX XX XX)
        />

        <Text style={styles.label}>Şifre</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (text.length >= 6) {
              setPasswordError('');
            }
          }}
          secureTextEntry
          placeholderTextColor={COLORS.gray}
          returnKeyType="done"
          blurOnSubmit={true}
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          )}
        </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.linkText}>
              Zaten hesabınız var mı? <Text style={styles.linkBold}>Giriş Yap</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.padding * 1.5,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    fontSize: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    marginTop: 5,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: 14,
    fontSize: SIZES.lg,
    color: COLORS.black,
    backgroundColor: COLORS.background,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  roleButton: {
    flex: 1,
    padding: 14,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  roleActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  roleText: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    fontWeight: '600',
  },
  roleTextActive: {
    color: COLORS.primary,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.lg,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    fontSize: SIZES.md,
    color: COLORS.gray,
  },
  linkBold: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: SIZES.sm,
    marginTop: 4,
  },
});