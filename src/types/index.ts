export type UserRole = 'customer' | 'worker' | 'admin';

export type WorkerStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  rating: number;
  totalRatings: number;
  location?: { lat: number; lng: number };
  isOnline?: boolean;
  createdAt: number;
  savedAddresses?: SavedAddress[];
  // Worker fields
  workerStatus?: WorkerStatus;
  vehicleType?: string;
  idNumber?: string;
  skills?: string[];
  bio?: string;
  suspended?: boolean;
  // New features
  workSchedule?: WorkScheduleDay[];
  referralCode?: string;
  referralsUsed?: string[];
}

export interface WorkScheduleDay {
  day: string;
  active: boolean;
  start: string;
  end: string;
}

export interface SavedAddress {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'home' | 'work' | 'other';
}

export type OrderStatus =
  | 'searching_worker'
  | 'worker_found'
  | 'on_the_way'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type ServiceType = 'delivery' | 'shopping' | 'cleaning' | 'moving';

export type PaymentMethod = 'cod' | 'online';

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface OrderStop {
  address: string;
  lat: number;
  lng: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  workerId?: string;
  workerName?: string;
  workerPhone?: string;
  serviceType: ServiceType;
  status: OrderStatus;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  destinationAddress: string;
  destinationLat: number;
  destinationLng: number;
  stops?: OrderStop[];
  notes: string;
  distance: number;
  price: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  paidAt?: number;
  invoiceId?: string;
  promoCode?: string;
  discountAmount?: number;
  scheduledAt?: number;
  isScheduled?: boolean;
  cancelReason?: string;
  cancelledBy?: string;
  emergencyAlert?: { message: string; timestamp: number };
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  customerRating?: number;
  customerReview?: string;
  workerRating?: number;
  workerReview?: string;
  workerLocation?: { lat: number; lng: number; timestamp: number };
  photos?: OrderPhotos;
}

export interface OrderPhotos {
  before?: string[];
  after?: string[];
}

export interface LiveLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: number;
}

export interface ChatRoom {
  orderId: string;
  messages: ChatMessage[];
  lastUpdated: number;
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minOrder: number;
  validUntil: number;
  usageCount: number;
  maxUsage: number;
}

export const SERVICE_CATEGORIES: { id: ServiceType; name: string; color: string; img: string }[] = [
  { id: 'delivery', name: 'Delivery', color: '#3B9BFF', img: '/images/delivery.png' },
  { id: 'shopping', name: 'Shopping', color: '#10B981', img: '/images/shopping.png' },
  { id: 'cleaning', name: 'Cleaning', color: '#8B5CF6', img: '/images/cleaning.png' },
  { id: 'moving', name: 'Moving', color: '#EC4899', img: '/images/moving.png' },
];

export const STATUS_LABELS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  searching_worker: { label: 'Mencari Pekerja', color: '#F59E0B', bg: '#FEF3C7' },
  worker_found: { label: 'Pekerja Ditemukan', color: '#3B82F6', bg: '#DBEAFE' },
  on_the_way: { label: 'Dalam Perjalanan', color: '#10B981', bg: '#D1FAE5' },
  arrived: { label: 'Tiba di Lokasi', color: '#8B5CF6', bg: '#EDE9FE' },
  in_progress: { label: 'Sedang Dikerjakan', color: '#F97316', bg: '#FFEDD5' },
  completed: { label: 'Selesai', color: '#10B981', bg: '#D1FAE5' },
  cancelled: { label: 'Dibatalkan', color: '#EF4444', bg: '#FEE2E2' },
};

export const SERVICE_LABELS: Record<ServiceType, string> = {
  delivery: 'Pengiriman',
  shopping: 'Belanja',
  cleaning: 'Kebersihan',
  moving: 'Pindahan',
};

export const CANCEL_REASONS = [
  'Changed my mind',
  'Wait too long',
  'Wrong address',
  'Price too high',
  'Other',
];

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'cod', label: 'Cash on Delivery (COD)', icon: 'banknote' },
  { id: 'online', label: 'Online Payment', icon: 'credit-card' },
];

export function formatPrice(price: number): string {
  return `₺${price.toLocaleString('tr-TR')}`;
}
