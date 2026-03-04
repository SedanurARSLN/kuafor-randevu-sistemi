import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES } from '../constants/theme';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Merhaba 👋</Text>
        <Text style={styles.name}>{user?.full_name}</Text>
        <Text style={styles.role}>
          {user?.role === 'provider' ? '💈 Kuaför' : '👤 Müşteri'}
        </Text>
      </View>

      <View style={styles.cards}>
        {user?.role === 'customer' ? (
          <>
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('Appointments')}
            >
              <Text style={styles.cardIcon}>📅</Text>
              <Text style={styles.cardTitle}>Randevularım</Text>
              <Text style={styles.cardDesc}>Randevularınızı görüntüleyin</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('Appointments')}
            >
              <Text style={styles.cardIcon}>📅</Text>
              <Text style={styles.cardTitle}>Randevularım</Text>
              <Text style={styles.cardDesc}>Gelen randevuları yönetin</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('MyServices')}
            >
              <Text style={styles.cardIcon}>✂️</Text>
              <Text style={styles.cardTitle}>Hizmetlerim</Text>
              <Text style={styles.cardDesc}>Hizmetlerinizi yönetin</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  header: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: 24,
    marginBottom: 24,
  },
  greeting: {
    fontSize: SIZES.lg,
    color: 'rgba(255,255,255,0.8)',
  },
  name: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 4,
  },
  role: {
    fontSize: SIZES.md,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  cards: {
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  cardDesc: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    marginTop: 4,
  },
});