import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import ProvidersScreen from '../screens/ProvidersScreen';
import BookAppointmentScreen from '../screens/BookAppointmentScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Müşteri Tabs
function CustomerTabs() {
  const { logout } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: { paddingBottom: 5, height: 60 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏠</Text>,
          headerTitle: '💈 Kuaför Randevu',
          headerRight: () => (
            <Text onPress={logout} style={{ marginRight: 16, color: COLORS.danger, fontWeight: '600' }}>
              Çıkış
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Providers"
        component={ProvidersScreen}
        options={{
          title: 'Kuaförler',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>💈</Text>,
          headerTitle: '💈 Kuaförler',
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          title: 'Randevularım',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>📅</Text>,
          headerTitle: '📅 Randevularım',
        }}
      />
    </Tab.Navigator>
  );
}

// Kuaför Tabs
function ProviderTabs() {
  const { logout } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: { paddingBottom: 5, height: 60 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏠</Text>,
          headerTitle: '💈 Kuaför Paneli',
          headerRight: () => (
            <Text onPress={logout} style={{ marginRight: 16, color: COLORS.danger, fontWeight: '600' }}>
              Çıkış
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          title: 'Randevularım',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>📅</Text>,
          headerTitle: '📅 Gelen Randevular',
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : user.role === 'provider' ? (
          <Stack.Screen name="ProviderApp" component={ProviderTabs} />
        ) : (
          <>
            <Stack.Screen name="CustomerApp" component={CustomerTabs} />
            <Stack.Screen
              name="BookAppointment"
              component={BookAppointmentScreen}
              options={{
                headerShown: true,
                headerTitle: '📅 Randevu Al',
                headerTintColor: COLORS.primary,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}