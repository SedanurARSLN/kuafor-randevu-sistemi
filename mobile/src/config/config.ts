const envApiUrl =
  typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL
    ? String(process.env.EXPO_PUBLIC_API_URL).trim()
    : '';

export const API_URL =
  envApiUrl.length > 0
    ? envApiUrl
    : 'https://kuafor-randevu-sistemi-3shp.onrender.com/api';

const envStripe =
  typeof process !== 'undefined' && process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? String(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY).trim()
    : '';

/**
 * Stripe Dashboard → Developers → API keys → Publishable key (pk_test_...).
 * Ya burayı güncelle ya da proje kökünde .env ile EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... verip yeniden derle (expo run:android).
 */
export const STRIPE_PUBLISHABLE_KEY =
  envStripe.length > 0
    ? envStripe
    : 'pk_test_51TM68zDPhSfQxDHlVN9J3bTrKiGX3BJVQ7xV9kBYAHqJakmuetTToh9XXtYkfZMyFWm5YGqa4pFd0f9yTpFgiGpO00RVIQYDdP';

export function isStripePublishableKeyConfigured(): boolean {
  const k = STRIPE_PUBLISHABLE_KEY.trim();
  if (!k || k.includes('YOUR_KEY')) return false;
  return (k.startsWith('pk_test_') || k.startsWith('pk_live_')) && k.length >= 50;
}
