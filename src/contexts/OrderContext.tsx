import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { trpc } from '@/providers/trpc';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import type { ServiceType, OrderData } from '@/types';

const OrderContext = createContext<ReturnType<typeof useOrderData> | null>(null);

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within OrderProvider');
  return context;
}

function useOrderData() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  // Queries
  const allOrders = trpc.order.list.useQuery(undefined, {
    enabled: !!userProfile,
  });

  const myOrders = trpc.order.myOrders.useQuery(undefined, {
    enabled: userProfile?.role === 'customer',
  });

  const workerOrders = trpc.order.workerOrders.useQuery(undefined, {
    enabled: userProfile?.role === 'worker',
  });

  const availableOrders = trpc.order.available.useQuery(undefined, {
    enabled: userProfile?.role === 'worker',
  });

  // Get appropriate orders based on role
  const orders = userProfile?.role === 'worker'
    ? (workerOrders.data || availableOrders.data || [])
    : (myOrders.data || allOrders.data || []);

  // Mutations
  const createOrderMutation = trpc.order.create.useMutation({
    onSuccess: (orderId) => {
      utils.order.list.invalidate();
      utils.order.myOrders.invalidate();
      utils.order.available.invalidate();
    },
  });

  const acceptOrderMutation = trpc.order.accept.useMutation({
    onSuccess: () => {
      utils.order.list.invalidate();
      utils.order.workerOrders.invalidate();
      utils.order.available.invalidate();
    },
  });

  const cancelOrderMutation = trpc.order.cancel.useMutation({
    onSuccess: () => {
      utils.order.list.invalidate();
      utils.order.myOrders.invalidate();
    },
  });

  const rateOrderMutation = trpc.order.rate.useMutation({
    onSuccess: () => {
      utils.order.list.invalidate();
      utils.order.myOrders.invalidate();
    },
  });

  const markPaidMutation = trpc.order.markPaid.useMutation({
    onSuccess: () => {
      utils.order.list.invalidate();
      utils.order.myOrders.invalidate();
    },
  });

  const updateLocationMutation = trpc.order.updateLocation.useMutation();

  const addPhotoMutation = trpc.order.addPhoto.useMutation();

  const updateStatusMutation = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      utils.order.list.invalidate();
    },
  });

  const createOrder = useCallback(async (orderData: OrderData) => {
    const result = await createOrderMutation.mutateAsync({
      serviceType: orderData.serviceType,
      pickupAddress: orderData.pickupAddress,
      pickupLat: orderData.pickupLat,
      pickupLng: orderData.pickupLng,
      destinationAddress: orderData.destinationAddress,
      destinationLat: orderData.destinationLat,
      destinationLng: orderData.destinationLng,
      stops: orderData.stops,
      notes: orderData.notes,
      price: orderData.price,
      distance: orderData.distance,
      isScheduled: orderData.isScheduled,
      scheduledAt: orderData.scheduledAt,
    });
    return result;
  }, [createOrderMutation]);

  const acceptOrder = useCallback(async (orderId: string) => {
    await acceptOrderMutation.mutateAsync({ orderId });
  }, [acceptOrderMutation]);

  const cancelOrder = useCallback(async (orderId: string, reason: string) => {
    await cancelOrderMutation.mutateAsync({ orderId, reason });
  }, [cancelOrderMutation]);

  const rateOrder = useCallback(async (
    orderId: string,
    rating: number,
    review: string,
    isCustomer: boolean
  ) => {
    if (isCustomer) {
      await rateOrderMutation.mutateAsync({
        orderId,
        customerRating: rating,
        customerReview: review,
      });
    } else {
      await rateOrderMutation.mutateAsync({
        orderId,
        workerRating: rating,
        workerReview: review,
      });
    }
  }, [rateOrderMutation]);

  const markPaid = useCallback(async (orderId: string) => {
    await markPaidMutation.mutateAsync({ orderId });
  }, [markPaidMutation]);

  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    await updateStatusMutation.mutateAsync({ orderId, status });
  }, [updateStatusMutation]);

  const updateWorkerLocation = useCallback(async (orderId: string, lat: number, lng: number) => {
    await updateLocationMutation.mutateAsync({ orderId, lat, lng });
  }, [updateLocationMutation]);

  const addOrderPhoto = useCallback(async (orderId: string, type: 'before' | 'after', url: string) => {
    await addPhotoMutation.mutateAsync({ orderId, type, url });
  }, [addPhotoMutation]);

  const refreshOrders = useCallback(() => {
    utils.order.list.invalidate();
    utils.order.myOrders.invalidate();
    utils.order.workerOrders.invalidate();
    utils.order.available.invalidate();
  }, [utils]);

  // Send emergency (console only for now)
  const sendEmergency = useCallback((orderId: string, message: string) => {
    console.log('EMERGENCY:', orderId, message);
    toast('Emergency alert sent!', 'error');
  }, [toast]);

  return {
    orders: orders.map(o => ({
      id: o.id,
      customerId: String(o.customerId),
      customerName: o.customer?.name || 'Customer',
      customerPhone: o.customer?.phone || '',
      workerId: o.workerId ? String(o.workerId) : undefined,
      workerName: o.worker?.name || undefined,
      workerPhone: o.worker?.phone || undefined,
      serviceType: o.serviceType as ServiceType,
      pickupAddress: o.pickupAddress,
      pickupLat: parseFloat(String(o.pickupLat)),
      pickupLng: parseFloat(String(o.pickupLng)),
      destinationAddress: o.destinationAddress,
      destinationLat: parseFloat(String(o.destinationLat)),
      destinationLng: parseFloat(String(o.destinationLng)),
      stops: o.stops ? JSON.parse(String(o.stops)) : undefined,
      notes: o.notes || undefined,
      price: o.price,
      distance: parseFloat(String(o.distance || '0')),
      status: o.status,
      paymentMethod: o.paymentMethod || 'cod',
      paymentStatus: o.paymentStatus || 'unpaid',
      promoCode: o.promoCode || undefined,
      discountAmount: o.discountAmount || 0,
      isScheduled: o.isScheduled || false,
      scheduledAt: o.scheduledAt ? new Date(o.scheduledAt).getTime() : undefined,
      workerLocation: o.workerLocation ? JSON.parse(String(o.workerLocation)) : undefined,
      cancelledBy: o.cancelledBy || undefined,
      cancelReason: o.cancelReason || undefined,
      customerRating: o.customerRating || undefined,
      customerReview: o.customerReview || undefined,
      workerRating: o.workerRating || undefined,
      workerReview: o.workerReview || undefined,
      paidAt: o.paidAt ? new Date(o.paidAt).getTime() : undefined,
      createdAt: new Date(o.createdAt).getTime(),
    })),
    createOrder,
    acceptOrder,
    cancelOrder,
    rateOrder,
    markPaid,
    updateOrderStatus,
    updateWorkerLocation,
    addOrderPhoto,
    refreshOrders,
    sendEmergency,
    isLoading: allOrders.isLoading || myOrders.isLoading || workerOrders.isLoading,
  };
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const data = useOrderData();
  return <OrderContext.Provider value={data}>{children}</OrderContext.Provider>;
}
