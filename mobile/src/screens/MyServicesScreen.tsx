import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Modal, TextInput, RefreshControl,
  KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { COLORS, SIZES, FONTS, GRADIENTS, SHADOWS } from '../constants/theme';

const STRIP_COLORS = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.completed, COLORS.danger];

export default function MyServicesScreen() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', duration_minutes: '', price: '' });
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(useCallback(() => { fetchServices(); }, []));

  const fetchServices = async () => {
    try {
      const response = await api.get('/services/my');
      setServices(response.data.data);
    } catch {
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
      } else {
        await api.post('/services', data);
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
        text: 'Evet, Sil', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/services/${id}`);
            fetchServices();
          } catch (error: any) {
            Alert.alert('Hata', error.response?.data?.message || 'Silinemedi');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Hizmetlerim</Text>
        <Text style={styles.pageCount}>{services.length} hizmet tanımlı</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchServices(); }}
              colors={[COLORS.primary]}
            />
          }
          renderItem={({ item, index }) => {
            const strip = STRIP_COLORS[index % STRIP_COLORS.length];
            return (
              <View style={[styles.card, SHADOWS.sm]}>
                <View style={[styles.strip, { backgroundColor: strip }]} />
                <View style={styles.cardInner}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.serviceName}>{item.name}</Text>
                      {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
                    </View>
                    <View style={[styles.badge, { backgroundColor: item.is_active ? COLORS.success + '15' : COLORS.danger + '15' }]}>
                      <View style={[styles.badgeDot, { backgroundColor: item.is_active ? COLORS.success : COLORS.danger }]} />
                      <Text style={[styles.badgeText, { color: item.is_active ? COLORS.success : COLORS.danger }]}>
                        {item.is_active ? 'Aktif' : 'Pasif'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailsRow}>
                    <View style={styles.detailChip}>
                      <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
                      <Text style={styles.detailText}>{item.duration_minutes} dk</Text>
                    </View>
                    <Text style={styles.price}>₺{item.price}</Text>
                  </View>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.iconActionBtn, { backgroundColor: COLORS.primary + '12' }]}
                      onPress={() => openEditModal(item)}
                    >
                      <Ionicons name="create-outline" size={18} color={COLORS.primary} />
                      <Text style={[styles.iconActionText, { color: COLORS.primary }]}>Düzenle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.iconActionBtn, { backgroundColor: COLORS.danger + '12' }]}
                      onPress={() => handleDelete(item.id, item.name)}
                    >
                      <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                      <Text style={[styles.iconActionText, { color: COLORS.danger }]}>Sil</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="cut-outline" size={48} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>Henüz hizmet eklemediniz</Text>
              <Text style={styles.emptySubtitle}>Müşteri çekebilmek için hizmetlerinizi ekleyin</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={openAddModal}>
                <Text style={styles.emptyBtnText}>Hizmet Ekle</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, SHADOWS.lg]} onPress={openAddModal} activeOpacity={0.85}>
        <LinearGradient colors={GRADIENTS.primaryDark} style={styles.fabInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="add" size={28} color={COLORS.white} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalKeyboard}
            >
              <ScrollView
                style={styles.modalSheet}
                contentContainerStyle={styles.modalScroll}
                keyboardShouldPersistTaps="handled"
                bounces={false}
              >
                <View style={styles.modalHandle} />
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalTitle}>
                    {editingService ? 'Hizmet Düzenle' : 'Yeni Hizmet'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => { Keyboard.dismiss(); setModalVisible(false); }}
                    style={styles.closeBtn}
                  >
                    <Ionicons name="close" size={22} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Hizmet Adi</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Örn: Saç Kesimi"
                    value={form.name}
                    onChangeText={(t) => setForm({ ...form, name: t })}
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                <Text style={styles.label}>Aciklama</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Örn: Erkek saç kesimi"
                    value={form.description}
                    onChangeText={(t) => setForm({ ...form, description: t })}
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Sure (dk)</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        placeholder="30"
                        value={form.duration_minutes}
                        onChangeText={(t) => setForm({ ...form, duration_minutes: t })}
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Fiyat (TL)</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        placeholder="250"
                        value={form.price}
                        onChangeText={(t) => setForm({ ...form, price: t })}
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.textMuted}
                        returnKeyType="done"
                      />
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.saveBtn, submitting && { opacity: 0.7 }]}
                  onPress={handleSave}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  <LinearGradient colors={GRADIENTS.primaryDark} style={styles.saveBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    {submitting ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <Text style={styles.saveBtnText}>{editingService ? 'Güncelle' : 'Ekle'}</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  pageHeader: {
    paddingHorizontal: SIZES.padding,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 52,
    paddingBottom: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  pageTitle: { fontFamily: FONTS.bold, fontSize: 22, color: COLORS.textPrimary },
  pageCount: { fontFamily: FONTS.medium, fontSize: SIZES.sm, color: COLORS.textMuted },
  list: { padding: SIZES.padding, paddingBottom: 100 },

  card: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radiusLg,
    marginBottom: 10, overflow: 'hidden', flexDirection: 'row',
  },
  strip: { width: 4 },
  cardInner: { flex: 1, padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  serviceName: { fontFamily: FONTS.semiBold, fontSize: SIZES.lg, color: COLORS.textPrimary },
  desc: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontFamily: FONTS.semiBold, fontSize: 11 },

  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  detailChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontFamily: FONTS.regular, fontSize: SIZES.sm, color: COLORS.textMuted },
  price: { fontFamily: FONTS.bold, fontSize: SIZES.xl, color: COLORS.primary },

  actions: { flexDirection: 'row', gap: 8 },
  iconActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: 10 },
  iconActionText: { fontFamily: FONTS.semiBold, fontSize: SIZES.sm },

  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIconBox: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: COLORS.primary + '12',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: SIZES.xl, color: COLORS.textPrimary, textAlign: 'center' },
  emptySubtitle: { fontFamily: FONTS.regular, fontSize: SIZES.md, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
  emptyBtn: {
    marginTop: 20, backgroundColor: COLORS.primary,
    paddingHorizontal: 28, paddingVertical: 12, borderRadius: SIZES.radiusLg,
  },
  emptyBtnText: { fontFamily: FONTS.semiBold, color: COLORS.white, fontSize: SIZES.md },

  fab: {
    position: 'absolute', bottom: 90, right: 20,
    width: 60, height: 60, borderRadius: 30, overflow: 'hidden',
  },
  fabInner: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalKeyboard: { maxHeight: '92%' },
  modalSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  modalScroll: { padding: 24, paddingBottom: 40 },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: 16,
  },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: FONTS.bold, fontSize: SIZES.xl, color: COLORS.textPrimary },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'center', alignItems: 'center',
  },
  label: {
    fontFamily: FONTS.semiBold, fontSize: SIZES.sm, color: COLORS.textSecondary,
    letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 6, marginTop: 14,
  },
  inputWrapper: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: SIZES.radius,
    backgroundColor: COLORS.surfaceSecondary,
  },
  input: {
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: SIZES.md, fontFamily: FONTS.regular, color: COLORS.textPrimary,
  },
  row: { flexDirection: 'row', gap: 12 },
  saveBtn: { marginTop: 28, borderRadius: SIZES.radiusLg, overflow: 'hidden', ...SHADOWS.lg },
  saveBtnInner: { paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { fontFamily: FONTS.bold, color: COLORS.white, fontSize: SIZES.lg, letterSpacing: 0.5 },
});
