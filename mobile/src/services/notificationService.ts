import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import api from './api';

// Expo Go SDK 53+ push notification'ları desteklemiyor — sadece dev build'de çalıştır
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// ─── Ön planda bildirim davranışı: başlık + ses + badge göster
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Cihazdan Expo Push Token al ve backend'e kaydet.
 * Login / checkAuth sonrasında çağrılır.
 */
export async function registerForPushNotifications(): Promise<string | null> {
    // Expo Go'da push notification desteği kaldırıldı (SDK 53+)
    if (isExpoGo) {
        console.log('[Push] Expo Go\'da push desteklenmiyor — dev build gerekli');
        return null;
    }

    // Emülatörde Expo Push Token alınamaz (sadece gerçek cihaz)
    if (!Device.isDevice) {
        console.log('[Push] Gerçek cihaz gerekli — emülatörde push token alınamaz');
        return null;
    }

    // İzin kontrolü
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('[Push] Bildirim izni reddedildi');
        return null;
    }

    // Android kanalı
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Randevu Bildirimleri',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#2563EB',
            sound: 'default',
        });
    }

    // Token al
    try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: '73ade11c-0ead-4866-b6ab-288922a2d70a', // app.json extra.eas.projectId
        });
        const token = tokenData.data;
        console.log('[Push] Expo token alındı:', token);

        // Backend'e kaydet (sessiz — hata olursa login'i engelleme)
        await savePushTokenToServer(token);

        return token;
    } catch (err) {
        console.warn('[Push] Token alınamadı:', err);
        return null;
    }
}

/**
 * Token'ı backend'e gönder
 */
async function savePushTokenToServer(token: string): Promise<void> {
    try {
        await api.post('/auth/push-token', { token });
        console.log('[Push] Token backend\'e kaydedildi');
    } catch (err) {
        console.warn('[Push] Token backend\'e kaydedilemedi:', err);
    }
}

/**
 * Bildirime tıklama handler'ı — ekran yönlendirmesi için kullanılır.
 * AppNavigator veya AuthContext içinde çağrılabilir.
 */
export function setupNotificationListeners(
    onNotificationTap?: (data: Record<string, unknown>) => void
): () => void {
    // Uygulama açıkken gelen bildirim
    const foregroundSub = Notifications.addNotificationReceivedListener(
        (notification: Notifications.Notification) => {
            console.log('[Push] Ön plan bildirimi:', notification.request.content.title);
        }
    );

    // Bildirime tıklama
    const responseSub = Notifications.addNotificationResponseReceivedListener(
        (response: Notifications.NotificationResponse) => {
            const data = response.notification.request.content.data as Record<string, unknown>;
            console.log('[Push] Bildirime tıklandı, data:', data);
            if (onNotificationTap) {
                onNotificationTap(data);
            }
        }
    );

    // Temizleme fonksiyonu
    return () => {
        foregroundSub.remove();
        responseSub.remove();
    };
}

/**
 * Uygulama push bildirimiyle açıldıysa veriyi döndür
 */
export async function getInitialNotificationData(): Promise<Record<string, unknown> | null> {
    const response = await Notifications.getLastNotificationResponseAsync();
    if (response) {
        return response.notification.request.content.data as Record<string, unknown>;
    }
    return null;
}
