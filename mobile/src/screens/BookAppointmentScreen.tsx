import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  ScrollView, ActivityIndicator, TextInput,
} from 'react-native';
import api from '../services/api';
import { appointmentService } from '../services/appointmentService';
import { COLORS, SIZES } from '../constants/theme';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

export default function BookAppointmentScreen({ route, navigation }: any) {
  const { provider } = route.params;
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busySlots, setBusySlots] = useState<string[]>([]);

  // Sonraki 7 günü oluştur
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return {
      full: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
      num: date.getDate(),
      month: date.toLocaleDateString('tr-TR', { month: 'short' }),
    };
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get(`/auth/providers/${provider.id}/services`);
      setServices(response.data.data);
    } catch (error) {
      Alert.alert('Hata', 'Hizmetler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusySlots = async () => {
    try {
      const appointments = await providerAppointmentService.getAppointmentsByDate(provider.id, selectedDate);
      // Dolu saatleri çıkar
      const slots = appointments.map((a: any) => a.start_time);
      setBusySlots(slots);
    } catch (error) {
      setBusySlots([]);
    }
  };

  useEffect(() => {
    if (selectedDate && provider?.id) {
      fetchBusySlots();
    } else {
      setBusySlots([]);
    }
  }, [selectedDate, provider?.id]);

  const getTotalDuration = () => selectedServices.reduce((sum, s) => sum + Number(s.duration_minutes), 0);
  const getTotalPrice = () => selectedServices.reduce((sum, s) => sum + Number(s.price), 0);

  const handleBook = async () => {
    if (selectedServices.length === 0 || !selectedDate || !selectedTime) {
      Alert.alert('Hata', 'Lütfen en az bir hizmet, tarih ve saat seçin');
      return;
    }
    setSubmitting(true);
    try {
      const serviceIds = selectedServices.map((s) => s.id);
      const totalPrice = getTotalPrice();
      // LOG: API'ye gönderilen veriyi konsola yazdır
      console.log({
        provider_id: provider.id,
        service_ids: serviceIds,
        appointment_date: selectedDate,
        start_time: selectedTime,
        total_price: totalPrice,
        notes: notes || undefined,
      });
      await appointmentService.create({
        provider_id: provider.id,
        service_ids: serviceIds,
        appointment_date: selectedDate,
        start_time: selectedTime,
        total_price: totalPrice,
        notes: notes || undefined,
      });
      Alert.alert('Başarılı! 🎉', 'Randevunuz oluşturuldu', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Randevu oluşturulamadı';
      const details = error.response?.data?.errors;
      Alert.alert('Hata', msg + (details ? '\n' + JSON.stringify(details) : ''));
      console.log('Doğrulama detayları:', details);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Kuaför Bilgisi */}
      <View style={styles.providerCard}>
        <Text style={styles.providerName}>💈 {provider.full_name}</Text>
        <Text style={styles.providerPhone}>📞 {provider.phone}</Text>
      </View>

      {/* Hizmet Seçimi */}
      <Text style={styles.sectionTitle}>✂️ Hizmet Seçin</Text>
      <View style={styles.grid}>
        {services.map((service) => {
          const isSelected = selectedServices.some((s) => s.id === service.id);
          return (
            <TouchableOpacity
              key={service.id}
              style={[styles.serviceCard, isSelected && styles.selected]}
              onPress={() => {
                if (isSelected) {
                  setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
                } else {
                  setSelectedServices([...selectedServices, service]);
                }
              }}
            >
              <Text style={[styles.serviceName, isSelected && styles.selectedText]}>
                {service.name}
              </Text>
              <Text style={styles.serviceDetail}>⏱ {service.duration_minutes} dk</Text>
              <Text style={[styles.servicePrice, isSelected && styles.selectedText]}>
                {service.price} TL
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tarih Seçimi */}
      <Text style={styles.sectionTitle}>📅 Tarih Seçin</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
        {dates.map((d) => (
          <TouchableOpacity
            key={d.full}
            style={[styles.dateCard, selectedDate === d.full && styles.selected]}
            onPress={() => setSelectedDate(d.full)}
          >
            <Text style={[styles.dateDay, selectedDate === d.full && styles.selectedText]}>
              {d.day}
            </Text>
            <Text style={[styles.dateNum, selectedDate === d.full && styles.selectedText]}>
              {d.num}
            </Text>
            <Text style={[styles.dateMonth, selectedDate === d.full && styles.selectedText]}>
              {d.month}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Saat Seçimi */}
      <Text style={styles.sectionTitle}>🕐 Saat Seçin</Text>
      <View style={styles.timeGrid}>
        {TIME_SLOTS.map((time) => {
          const isBusy = busySlots.includes(time);
          return (
            <TouchableOpacity
              key={time}
              style={[styles.timeCard, selectedTime === time && styles.selected, isBusy && styles.busy]}
              onPress={() => !isBusy && setSelectedTime(time)}
              disabled={isBusy}
            >
              <Text style={[styles.timeText, selectedTime === time && styles.selectedText, isBusy && styles.busyText]}>
                {time} {isBusy ? '⛔' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Not */}
      <Text style={styles.sectionTitle}>📝 Not (opsiyonel)</Text>
      <TextInput
        style={styles.noteInput}
        placeholder="Örn: Kısa kesim istiyorum"
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholderTextColor={COLORS.gray}
      />

      {/* Özet & Randevu Al */}
      {selectedServices.length > 0 && selectedDate && selectedTime && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>📋 Özet</Text>
          {selectedServices.map((service) => (
            <Text key={service.id} style={styles.summaryText}>✂️ {service.name} ({service.price} TL)</Text>
          ))}
          <Text style={styles.summaryText}>📅 {selectedDate}</Text>
          <Text style={styles.summaryText}>🕐 {selectedTime}</Text>
          <Text style={styles.summaryPrice}>💰 Toplam: {selectedServices.reduce((sum, s) => sum + Number(s.price), 0)} TL</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.bookButton, submitting && styles.buttonDisabled]}
        onPress={handleBook}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.bookButtonText}>📅 Randevu Al</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  providerCard: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius,
    padding: 20, marginBottom: 20,
  },
  providerName: { fontSize: SIZES.xxl, fontWeight: 'bold', color: COLORS.white },
  providerPhone: { fontSize: SIZES.md, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  sectionTitle: {
    fontSize: SIZES.xl, fontWeight: 'bold', color: COLORS.black,
    marginBottom: 12, marginTop: 8,
  },
  grid: { gap: 10, marginBottom: 16 },
  serviceCard: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radius,
    padding: 16, borderWidth: 2, borderColor: COLORS.lightGray,
  },
  selected: {
    borderColor: COLORS.primary, backgroundColor: '#EFF6FF',
  },
  serviceName: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.black },
  serviceDetail: { fontSize: SIZES.sm, color: COLORS.gray, marginTop: 4 },
  servicePrice: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.primary, marginTop: 4 },
  selectedText: { color: COLORS.primary },
  dateRow: { marginBottom: 16 },
  dateCard: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radius,
    padding: 14, marginRight: 10, alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.lightGray, minWidth: 70,
  },
  dateDay: { fontSize: SIZES.sm, color: COLORS.gray },
  dateNum: { fontSize: SIZES.xxl, fontWeight: 'bold', color: COLORS.black, marginVertical: 4 },
  dateMonth: { fontSize: SIZES.sm, color: COLORS.gray },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  timeCard: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radius,
    paddingVertical: 10, paddingHorizontal: 16,
    borderWidth: 2, borderColor: COLORS.lightGray,
  },
  timeText: { fontSize: SIZES.md, color: COLORS.black, fontWeight: '600' },
  noteInput: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radius,
    padding: 14, fontSize: SIZES.md, borderWidth: 1,
    borderColor: COLORS.lightGray, minHeight: 80, textAlignVertical: 'top',
    marginBottom: 16, color: COLORS.black,
  },
  summary: {
    backgroundColor: '#EFF6FF', borderRadius: SIZES.radius,
    padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.primary,
  },
  summaryTitle: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 },
  summaryText: { fontSize: SIZES.md, color: COLORS.black, marginBottom: 4 },
  summaryPrice: { fontSize: SIZES.xl, fontWeight: 'bold', color: COLORS.primary, marginTop: 4 },
  bookButton: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius,
    padding: 18, alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  bookButtonText: { color: COLORS.white, fontSize: SIZES.xl, fontWeight: 'bold' },
  busy: {
    borderColor: COLORS.gray,
    backgroundColor: '#F3F3F3',
    opacity: 0.5,
  },
  busyText: {
    color: COLORS.gray,
    textDecorationLine: 'line-through',
  },
});