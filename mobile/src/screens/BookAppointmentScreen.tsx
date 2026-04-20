import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  ScrollView, ActivityIndicator, TextInput, StatusBar, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { appointmentService } from '../services/appointmentService';
import { providerAppointmentService } from '../services/providerAppointmentService';
import { COLORS, SIZES, FONTS, GRADIENTS, SHADOWS } from '../constants/theme';
import { isStripePublishableKeyConfigured } from '../config/config';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

export default function BookAppointmentScreen({ route, navigation }: any) {
  const { provider } = route.params;
  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busySlots, setBusySlots] = useState<string[]>([]);

  const toLocalDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return {
      full: toLocalDateString(date),   // UTC değil, lokal tarih
      day: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
      num: date.getDate(),
      month: date.toLocaleDateString('tr-TR', { month: 'short' }),
    };
  });

  useEffect(() => { fetchServices(); }, []);

  useEffect(() => {
    if (selectedDate && provider?.id) fetchBusySlots();
    else setBusySlots([]);
  }, [selectedDate, provider?.id]);

  // Ekrana her dönüşte (iptal sonrası vb.) dolu saatleri yenile
  useFocusEffect(useCallback(() => {
    if (selectedDate && provider?.id) fetchBusySlots();
  }, [selectedDate, provider?.id]));

  const fetchServices = async () => {
    try {
      const response = await api.get(`/auth/providers/${provider.id}/services`);
      setServices(response.data.data);
    } catch {
      Alert.alert('Hata', 'Hizmetler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusySlots = async () => {
    try {
      const appointments = await providerAppointmentService.getAppointmentsByDate(provider.id, selectedDate);
      const occupied = new Set<string>();
      for (const a of appointments) {
        const st = a.start_time ? a.start_time.slice(0, 5) : '';
        const et = a.end_time   ? a.end_time.slice(0, 5)   : '';
        if (!st) continue;
        // start_time ile end_time arasındaki tüm 30 dk'lık slotları dolu işaretle
        const [sh, sm] = st.split(':').map(Number);
        const [eh, em] = et ? et.split(':').map(Number) : [sh, sm + 30];
        const startMin = sh * 60 + sm;
        const endMin   = eh * 60 + em;
        for (let m = startMin; m < endMin; m += 30) {
          const hh = String(Math.floor(m / 60)).padStart(2, '0');
          const mm = String(m % 60).padStart(2, '0');
          occupied.add(`${hh}:${mm}`);
        }
      }
      setBusySlots(Array.from(occupied));
    } catch {
      setBusySlots([]);
      Alert.alert('Uyarı', 'Dolu saatler yüklenemedi. Tüm saatler müsait görünebilir.');
    }
  };

  const getTotalPrice = () => selectedServices.reduce((sum, s) => sum + Number(s.price), 0);

  const toggleService = (service: any) => {
    const isSelected = selectedServices.some((s) => s.id === service.id);
    if (isSelected) setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
    else setSelectedServices([...selectedServices, service]);
  };

  const handleBook = async () => {
    if (selectedServices.length === 0 || !selectedDate || !selectedTime) {
      Alert.alert('Hata', 'Lütfen en az bir hizmet, tarih ve saat seçin');
      return;
    }
    setSubmitting(true);
    try {
      const result = await appointmentService.create({
        provider_id: provider.id,
        service_ids: selectedServices.map((s) => s.id),
        appointment_date: selectedDate,
        start_time: selectedTime,
        notes: notes || undefined,
      });

      const appointmentId = result.data?.id;
      if (appointmentId) {
        // Stripe kullanılamıyorsa hemen çık
        if (isExpoGo || !isStripePublishableKeyConfigured()) {
          Alert.alert(‘Randevu oluşturuldu’, ‘Ödeme dev build gerektirir. Randevunuz kaydedildi.’, [
            { text: ‘Tamam’, onPress: () => navigation.goBack() },
          ]);
          return;
        }

        try {
          // Stripe modülünü yükle
          const stripeModule = await import(‘@stripe/stripe-react-native’);
          const { initPaymentSheet, presentPaymentSheet } = stripeModule;

          // Backend’den clientSecret al
          const { paymentService } = await import(‘../services/appointmentService’);
          const paymentResult = await paymentService.createIntent(appointmentId);
          const clientSecret = paymentResult.data?.clientSecret as string | undefined;

          if (!clientSecret) {
            Alert.alert(‘Ödeme başlatılamadı’, ‘Sunucu clientSecret dönmedi. Randevunuz oluşturuldu.’, [
              { text: ‘Tamam’, onPress: () => navigation.goBack() },
            ]);
            return;
          }

          // Payment Sheet’i başlat
          const { error: initError } = await initPaymentSheet({
            paymentIntentClientSecret: clientSecret,
            merchantDisplayName: ‘Kuaför Randevu’,
            style: ‘automatic’,
          });
          if (initError) {
            Alert.alert(‘Ödeme formu açılamadı’, `${initError.message}\n\nRandevunuz oluşturuldu.`, [
              { text: ‘Tamam’, onPress: () => navigation.goBack() },
            ]);
            return;
          }

          // Payment Sheet’i göster
          const { error: payError } = await presentPaymentSheet();
          if (payError) {
            if (payError.code === ‘Canceled’) {
              Alert.alert(‘Ödeme iptal edildi’, ‘Randevunuz oluşturuldu, daha sonra ödeme yapabilirsiniz.’, [
                { text: ‘Tamam’, onPress: () => navigation.goBack() },
              ]);
              return;
            }
            Alert.alert(‘Ödeme başarısız’, `${payError.message}\n\nRandevunuz oluşturuldu.`, [
              { text: ‘Tamam’, onPress: () => navigation.goBack() },
            ]);
            return;
          }

          await paymentService.confirmPayment(appointmentId);
          Alert.alert(‘Başarılı!’, ‘Ödemeniz alındı ve randevunuz oluşturuldu.’, [
            { text: ‘Tamam’, onPress: () => navigation.goBack() },
          ]);
          return;
        } catch (e: any) {
          const status = e?.response?.status;
          const apiMsg =
            typeof e?.response?.data === 'object' && e?.response?.data?.message
              ? String(e.response.data.message)
              : '';
          let msg = apiMsg || e?.message || 'Ödeme başlatılamadı.';
          if (status === 404) {
            msg =
              'Sunucuda ödeme adresi bulunamadı (404). Render’da backend’in güncel kodu deploy edilmiş olmalı '
              + '(içinde /api/payments/create-intent rotası). GitHub’a push edip Manual Deploy yap veya '
              + 'Root Directory / Build Command ayarlarını kontrol et.';
          }
          if (status === 503) {
            Alert.alert(
              'Bilgi',
              `${msg}`,
              [{ text: 'Tamam', onPress: () => navigation.goBack() }],
            );
            return;
          }
          Alert.alert(
            'Ödeme hatası',
            `${msg}\n\nRandevunuz oluşturuldu.`,
            [{ text: 'Tamam', onPress: () => navigation.goBack() }],
          );
          return;
        }
      }

      Alert.alert('Başarılı!', 'Randevunuz oluşturuldu', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Randevu oluşturulamadı';
      Alert.alert('Hata', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const totalPrice = getTotalPrice();
  const isReady = selectedServices.length > 0 && selectedDate && selectedTime;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* Provider gradient header */}
      <LinearGradient
        colors={GRADIENTS.primaryDark}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{provider.full_name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.providerName}>{provider.full_name}</Text>
        <View style={styles.phoneRow}>
          <Ionicons name="call-outline" size={14} color="rgba(255,255,255,0.75)" />
          <Text style={styles.providerPhone}>{provider.phone}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Services */}
          <Text style={styles.sectionTitle}>Hizmet Seçin</Text>
        {services.map((service) => {
          const isSelected = selectedServices.some((s) => s.id === service.id);
          return (
            <TouchableOpacity
              key={service.id}
              style={[styles.serviceCard, SHADOWS.sm, isSelected && styles.serviceCardSelected]}
              onPress={() => toggleService(service)}
              activeOpacity={0.8}
            >
              {isSelected && <View style={styles.serviceStrip} />}
              <View style={styles.serviceInfo}>
                <Text style={[styles.serviceName, isSelected && styles.serviceNameSelected]}>{service.name}</Text>
                <View style={styles.serviceDetailRow}>
                  <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
                  <Text style={styles.serviceDetail}>{service.duration_minutes} dk</Text>
                </View>
              </View>
              <Text style={[styles.servicePrice, isSelected && styles.servicePriceSelected]}>
                ₺{service.price}
              </Text>
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Date Selection */}
          <Text style={styles.sectionTitle}>Tarih Seçin</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
          {dates.map((d) => {
            const isSelected = selectedDate === d.full;
            return (
              <TouchableOpacity
                key={d.full}
                onPress={() => setSelectedDate(d.full)}
                activeOpacity={0.8}
              >
                {isSelected ? (
                  <LinearGradient
                    colors={GRADIENTS.primaryDark}
                    style={[styles.dateCard, styles.dateCardSelected]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={[styles.dateDay, styles.dateDaySelected]}>{d.day}</Text>
                    <Text style={[styles.dateNum, styles.dateNumSelected]}>{d.num}</Text>
                    <Text style={[styles.dateMonth, styles.dateMonthSelected]}>{d.month}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.dateCard, SHADOWS.sm]}>
                    <Text style={styles.dateDay}>{d.day}</Text>
                    <Text style={styles.dateNum}>{d.num}</Text>
                    <Text style={styles.dateMonth}>{d.month}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time Slots */}
          <Text style={styles.sectionTitle}>Saat Seçin</Text>
        <View style={styles.timeGrid}>
          {TIME_SLOTS.map((time) => {
            const isBusy = busySlots.includes(time);
            const isSelected = selectedTime === time;
            return (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeCard,
                  isBusy && styles.timeCardBusy,
                  isSelected && styles.timeCardSelected,
                ]}
                onPress={() => !isBusy && setSelectedTime(time)}
                disabled={isBusy}
                activeOpacity={0.8}
              >
                {isBusy ? (
                  <Ionicons name="close" size={12} color={COLORS.danger} style={{ marginRight: 3 }} />
                ) : (
                  <View style={[styles.timeDot, isSelected && styles.timeDotSelected]} />
                )}
                <Text style={[
                  styles.timeText,
                  isBusy && styles.timeTextBusy,
                  isSelected && styles.timeTextSelected,
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Note */}
          <Text style={styles.sectionTitle}>Not (opsiyonel)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Örn: Kısa kesim istiyorum"
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholderTextColor={COLORS.textMuted}
        />

        {/* Summary */}
        {isReady && (
          <LinearGradient
            colors={['#EFF6FF', '#DBEAFE']}
            style={styles.summary}
          >
            <Text style={styles.summaryTitle}>Randevu Özeti</Text>
            {selectedServices.map((s) => (
              <View key={s.id} style={styles.summaryRow}>
                <Ionicons name="cut-outline" size={14} color={COLORS.primary} />
                <Text style={styles.summaryText}>{s.name}</Text>
                <Text style={styles.summaryPrice2}>₺{s.price}</Text>
              </View>
            ))}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
              <Text style={styles.summaryText}>{selectedDate}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="time-outline" size={14} color={COLORS.primary} />
              <Text style={styles.summaryText}>{selectedTime}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Toplam Tutar</Text>
              <Text style={styles.totalAmount}>₺{totalPrice}</Text>
            </View>
          </LinearGradient>
        )}

        <TouchableOpacity
          style={[styles.bookBtnWrapper, submitting && { opacity: 0.7 }]}
          onPress={handleBook}
          disabled={submitting}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={GRADIENTS.primaryDark}
            style={styles.bookBtn2}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="calendar-check" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                <Text style={styles.bookBtnText}>Randevu Oluştur</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SIZES.padding, paddingBottom: 40 },

  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight ?? 0) + 16,
    paddingBottom: 28,
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 0) + 12,
    left: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 10,
  },
  avatarText: { fontFamily: FONTS.bold, fontSize: 28, color: COLORS.white },
  providerName: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.white },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  providerPhone: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: 'rgba(255,255,255,0.75)' },

  sectionTitle: {
    fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textSecondary,
    letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 20, marginBottom: 10,
  },

  serviceCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: SIZES.radiusLg,
    padding: 14, marginBottom: 8,
    borderWidth: 1.5, borderColor: COLORS.border,
    overflow: 'hidden',
  },
  serviceCardSelected: { borderColor: COLORS.primary, backgroundColor: '#EFF6FF' },
  serviceStrip: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
    backgroundColor: COLORS.primary,
  },
  serviceInfo: { flex: 1, marginLeft: 4 },
  serviceName: { fontFamily: FONTS.semiBold, fontSize: SIZES.md, color: COLORS.textPrimary },
  serviceNameSelected: { color: COLORS.primary },
  serviceDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  serviceDetail: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textMuted },
  servicePrice: { fontFamily: FONTS.bold, fontSize: SIZES.lg, color: COLORS.textSecondary },
  servicePriceSelected: { color: COLORS.primary },
  checkBadge: { marginLeft: 8 },

  dateRow: { marginBottom: 4 },
  dateCard: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radiusLg,
    paddingVertical: 14, paddingHorizontal: 16,
    marginRight: 10, alignItems: 'center', minWidth: 72,
  },
  dateCardSelected: {},
  dateDay: { fontFamily: FONTS.medium, fontSize: SIZES.xs, color: COLORS.textMuted, textTransform: 'uppercase' },
  dateDaySelected: { color: 'rgba(255,255,255,0.8)' },
  dateNum: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.textPrimary, marginVertical: 4 },
  dateNumSelected: { color: COLORS.white },
  dateMonth: { fontFamily: FONTS.regular, fontSize: SIZES.xs, color: COLORS.textMuted },
  dateMonthSelected: { color: 'rgba(255,255,255,0.8)' },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  timeCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: SIZES.radius,
    paddingVertical: 9, paddingHorizontal: 14,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  timeCardBusy: { backgroundColor: '#FEF2F2', borderColor: COLORS.danger + '40' },
  timeCardSelected: { borderColor: COLORS.primary, backgroundColor: '#EFF6FF' },
  timeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.success, marginRight: 6 },
  timeDotSelected: { backgroundColor: COLORS.primary },
  timeText: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textPrimary },
  timeTextBusy: { color: COLORS.danger, textDecorationLine: 'line-through' },
  timeTextSelected: { color: COLORS.primary },

  noteInput: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radius,
    padding: 14, fontSize: SIZES.md, borderWidth: 1.5,
    borderColor: COLORS.border, minHeight: 80, textAlignVertical: 'top',
    marginBottom: 16, fontFamily: FONTS.regular, color: COLORS.textPrimary,
  },

  summary: {
    borderRadius: SIZES.radiusLg, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.primary + '30',
  },
  summaryTitle: { fontFamily: FONTS.semiBold, fontSize: SIZES.md, color: COLORS.primary, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  summaryText: { fontFamily: FONTS.regular, fontSize: SIZES.md, color: COLORS.textPrimary, flex: 1 },
  summaryPrice2: { fontFamily: FONTS.semiBold, fontSize: SIZES.md, color: COLORS.primary },
  summaryDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  totalLabel: { fontFamily: FONTS.semiBold, fontSize: SIZES.lg, color: COLORS.textPrimary },
  totalAmount: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.primary },

  bookBtnWrapper: { borderRadius: SIZES.radiusLg, overflow: 'hidden', ...SHADOWS.lg, marginTop: 4 },
  bookBtn2: { paddingVertical: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  bookBtnText: { fontFamily: FONTS.bold, color: COLORS.white, fontSize: SIZES.lg, letterSpacing: 0.5 },
});
