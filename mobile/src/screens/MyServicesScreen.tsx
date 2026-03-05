import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Modal, TextInput, RefreshControl,
  KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { COLORS, SIZES } from '../constants/theme';

export default function MyServicesScreen() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', duration_minutes: '', price: '' });
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchServices();
    }, [])
  );

  const fetchServices = async () => {
    try {
      const response = await api.get('/services/my');
      setServices(response.data.data);
    } catch (error) {
      Alert.alert('Hata', 'Hizmetler yüklenemedi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openAddModal = () => {
    setEditingService(null);
    setForm({ name: '', description: '', duration_minutes: '', price: '' });
    setModalVisible(true);
  };

  const openEditModal = (service: any) => {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description || '',
      duration_minutes: String(service.duration_minutes),
      price: String(service.price),
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.duration_minutes || !form.price) {
      Alert.alert('Hata', 'Ad, süre ve fiyat zorunludur');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        name: form.name,
        description: form.description,
        duration_minutes: parseInt(form.duration_minutes),
        price: parseFloat(form.price),
      };

      if (editingService) {
        await api.put(`/services/${editingService.id}`, data);
        Alert.alert('Başarılı', 'Hizmet güncellendi');
      } else {
        await api.post('/services', data);
        Alert.alert('Başarılı', 'Hizmet eklendi');
      }

      setModalVisible(false);
      fetchServices();
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.message || 'İşlem başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Sil', `"${name}" hizmetini silmek istiyor musunuz?`, [
      { text: 'Hayır', style: 'cancel' },
      {
        text: 'Evet, Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/services/${id}`);
            fetchServices();
            Alert.alert('Başarılı', 'Hizmet silindi');
          } catch (error: any) {
            Alert.alert('Hata', error.response?.data?.message || 'Silinemedi');
          }
        },
      },
    ]);
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
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>➕ Yeni Hizmet Ekle</Text>
      </TouchableOpacity>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchServices(); }} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.serviceName}>✂️ {item.name}</Text>
              <View style={[styles.badge, { backgroundColor: item.is_active ? COLORS.success + '20' : COLORS.danger + '20' }]}>
                <Text style={{ color: item.is_active ? COLORS.success : COLORS.danger, fontSize: SIZES.sm, fontWeight: '600' }}>
                  {item.is_active ? 'Aktif' : 'Pasif'}
                </Text>
              </View>
            </View>
            {item.description && <Text style={styles.desc}>{item.description}</Text>}
            <View style={styles.details}>
              <Text style={styles.detail}>⏱ {item.duration_minutes} dk</Text>
              <Text style={styles.price}>💰 {item.price} TL</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
                onPress={() => openEditModal(item)}
              >
                <Text style={styles.actionText}>✏️ Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: COLORS.danger }]}
                onPress={() => handleDelete(item.id, item.name)}
              >
                <Text style={styles.actionText}>🗑 Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ fontSize: 50 }}>✂️</Text>
            <Text style={styles.emptyText}>Henüz hizmet eklemediniz</Text>
          </View>
        }
      />

      {/* ─── EKLE / DÜZENLE MODAL (KLAVYEİLE UYUMLU) */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalKeyboard}
            >
              <ScrollView
                style={styles.modalContent}
                contentContainerStyle={styles.modalScroll}
                keyboardShouldPersistTaps="handled"
                bounces={false}
              >
                {/* Kapat Butonu */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => { Keyboard.dismiss(); setModalVisible(false); }}
                >
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>

                <Text style={styles.modalTitle}>
                  {editingService ? '✏️ Hizmet Düzenle' : '➕ Yeni Hizmet'}
                </Text>

                <Text style={styles.label}>Hizmet Adı</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Örn: Saç Kesimi"
                  value={form.name}
                  onChangeText={(t) => setForm({ ...form, name: t })}
                  placeholderTextColor={COLORS.gray}
                  returnKeyType="next"
                />

                <Text style={styles.label}>Açıklama</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Örn: Erkek saç kesimi"
                  value={form.description}
                  onChangeText={(t) => setForm({ ...form, description: t })}
                  placeholderTextColor={COLORS.gray}
                  returnKeyType="next"
                />

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Süre (dk)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="30"
                      value={form.duration_minutes}
                      onChangeText={(t) => setForm({ ...form, duration_minutes: t })}
                      keyboardType="numeric"
                      placeholderTextColor={COLORS.gray}
                      returnKeyType="next"
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Fiyat (TL)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="250"
                      value={form.price}
                      onChangeText={(t) => setForm({ ...form, price: t })}
                      keyboardType="numeric"
                      placeholderTextColor={COLORS.gray}
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                    />
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: COLORS.gray }]}
                    onPress={() => { Keyboard.dismiss(); setModalVisible(false); }}
                  >
                    <Text style={styles.modalBtnText}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: COLORS.primary }]}
                    onPress={handleSave}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <Text style={styles.modalBtnText}>
                        {editingService ? 'Güncelle' : 'Ekle'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  list: { padding: SIZES.padding },
  addButton: {
    backgroundColor: COLORS.primary, margin: SIZES.padding,
    marginBottom: 0, borderRadius: SIZES.radius, padding: 14, alignItems: 'center',
  },
  addButtonText: { color: COLORS.white, fontSize: SIZES.lg, fontWeight: 'bold' },
  card: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radius,
    padding: 16, marginTop: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceName: { fontSize: SIZES.xl, fontWeight: 'bold', color: COLORS.black },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  desc: { fontSize: SIZES.md, color: COLORS.gray, marginTop: 6 },
  details: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  detail: { fontSize: SIZES.md, color: COLORS.black },
  price: { fontSize: SIZES.lg, fontWeight: 'bold', color: COLORS.primary },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, padding: 10, borderRadius: SIZES.radius, alignItems: 'center' },
  actionText: { color: COLORS.white, fontWeight: '600', fontSize: SIZES.sm },
  emptyText: { fontSize: SIZES.lg, color: COLORS.gray, marginTop: 10 },
  // Modal - YENİ
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalKeyboard: { maxHeight: '90%' },
  modalContent: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  modalScroll: { padding: 24, paddingBottom: 40 },
  closeButton: {
    position: 'absolute', right: 0, top: 0, padding: 8, zIndex: 10,
  },
  closeText: { fontSize: 22, color: COLORS.gray, fontWeight: 'bold' },
  modalTitle: { fontSize: SIZES.xxl, fontWeight: 'bold', color: COLORS.black, marginBottom: 16 },
  label: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.black, marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1, borderColor: COLORS.lightGray, borderRadius: SIZES.radius,
    padding: 12, fontSize: SIZES.lg, color: COLORS.black, backgroundColor: COLORS.background,
  },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalBtn: { flex: 1, padding: 14, borderRadius: SIZES.radius, alignItems: 'center' },
  modalBtnText: { color: COLORS.white, fontSize: SIZES.lg, fontWeight: 'bold' },
});