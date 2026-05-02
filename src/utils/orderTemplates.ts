import type { OrderData } from '@/types';

const STORAGE_KEY = 'boh_order_templates';

export interface OrderTemplate {
  id: string;
  name: string;
  serviceType: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  destinationAddress: string;
  destinationLat: number;
  destinationLng: number;
  notes?: string;
  createdAt: number;
}

export function getTemplates(): OrderTemplate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveTemplate(name: string, order: OrderData): OrderTemplate {
  const templates = getTemplates();
  const template: OrderTemplate = {
    id: 'TMPL-' + Date.now().toString(36),
    name,
    serviceType: order.serviceType,
    pickupAddress: order.pickupAddress,
    pickupLat: order.pickupLat,
    pickupLng: order.pickupLng,
    destinationAddress: order.destinationAddress,
    destinationLat: order.destinationLat,
    destinationLng: order.destinationLng,
    notes: order.notes,
    createdAt: Date.now(),
  };
  templates.push(template);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  return template;
}

export function deleteTemplate(id: string) {
  const templates = getTemplates().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function orderFromTemplate(template: OrderTemplate): OrderData {
  return {
    serviceType: template.serviceType as any,
    pickupAddress: template.pickupAddress,
    pickupLat: template.pickupLat,
    pickupLng: template.pickupLng,
    destinationAddress: template.destinationAddress,
    destinationLat: template.destinationLat,
    destinationLng: template.destinationLng,
    notes: template.notes,
    price: 0, // will be calculated
    distance: 0,
  };
}
