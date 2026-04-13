import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { COLORS, SIZES } from '../constants/theme';

const STATUS_MAP: Record<string, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  pending: { label: 'Bekliyor', color: COLORS.pending, icon: 'time-outline' },
  confirmed: { label: 'Onaylandi', color: COLORS.confirmed, icon: 'checkmark-circle-outline' },
  cancelled: { label: 'Iptal', color: COLORS.cancelled, icon: 'close-circle-outline' },
  completed: { label: 'Tamamlandi', color: COLORS.completed, icon: 'checkmark-done-outline' },
};

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getMyAppointments();
      setAppointments(response.data);
    } catch (error) {
      Alert.alert('Hata', 'Randevular yüklenemedi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const handleAction = async (id: string, action: 'confirm' | 'cancel' | 'complete') => {
    const messages: any = {
      confirm: 'Randevuyu onaylamak istiyor musunuz?',
      cancel: 'Randevuyu iptal etmek istiyor musunuz?',
      complete: 'Randevuyu tamamlamak istiyor musunuz?',
    };

    Alert.alert('Onay', messages[action], [
      { text: 'Hayır', style: 'cancel' },
      {
        text: 'Evet',
        onPress: async () => {
          try {
            if (action === 'confirm') await appointmentService.confirm(id);
            if (action === 'cancel') await appointmentService.cancel(id);
            if (action === 'complete') await appointmentService.complete(id);
            fetchAppointments();
            Alert.alert('Başarılı', 'İşlem tamamlandı');
          } catch (error: any) {
            Alert.alert('Hata', error.response?.data?.message || 'İşlem başarısız');
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderItem = ({ item }: any) => {
    const status = STATUS_MAP[item.status] || STATUS_MAP.pending;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.serviceName}>{item.service_name}</Text>
            <Text style={styles.personName}>
              {user?.role === 'provider'
                ? item.customer_name
                : item.provider_name}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <Ionicons name={status.icon} size={14} color={status.color} />
            <Text style={[styles.statusText, { color: status.color, marginLeft: 4 }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.info}>{formatDate(item.appointment_date)}</Text>
          <Text style={styles.info}>{item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}</Text>
          <Text style={styles.price}>{item.total_price} TL</Text>
          {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
        </View>

        {/* Aksiyon Butonları */}
        <View style={styles.actions}>
          {user?.role === 'provider' && item.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
              onPress={() => handleAction(item.id, 'confirm')}
            >
              <Text style={styles.actionText}>Onayla</Text>
            </TouchableOpacity>
          )}

          {user?.role === 'provider' && item.status === 'confirmed' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.completed }]}
              onPress={() => handleAction(item.id, 'complete')}
            >
              <Text style={styles.actionText}>Tamamla</Text>
            </TouchableOpacity>
          )}

          {item.status !== 'cancelled' && item.status !== 'completed' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.danger }]}
              onPress={() => handleAction(item.id, 'cancel')}
            >
              <Text style={styles.actionText}>Iptal</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAppointments(); }} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="calendar-outline" size={60} color={COLORS.gray} />
            <Text style={styles.emptyText}>Henüz randevunuz yok</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: SIZES.padding },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceName: { fontSize: SIZES.xl, fontWeight: 'bold', color: COLORS.black },
  personName: { fontSize: SIZES.md, color: COLORS.gray, marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: SIZES.sm, fontWeight: '600' },
  cardBody: { marginBottom: 12 },
  info: { fontSize: SIZES.md, color: COLORS.black, marginBottom: 4 },
  price: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.primary, marginTop: 4 },
  notes: { fontSize: SIZES.sm, color: COLORS.gray, marginTop: 4, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, padding: 10, borderRadius: SIZES.radius, alignItems: 'center' },
  actionText: { color: COLORS.white, fontWeight: '600', fontSize: SIZES.sm },
  emptyIcon: { fontSize: 60, marginBottom: 10 },
  emptyText: { fontSize: SIZES.lg, color: COLORS.gray },
});