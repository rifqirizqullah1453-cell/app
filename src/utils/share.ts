// Share utility with Web Share API fallback
export async function shareInvoice(orderId: string, total: number, method: string = 'COD') {
  const url = `${window.location.origin}/invoice/${orderId}`;
  const text = `Boh-Hizmet Invoice\nOrder: ${orderId}\nTotal: ₺${total.toLocaleString('tr-TR')}\nPayment: ${method}\n${url}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Boh-Hizmet Invoice', text, url });
      return true;
    } catch {
      // User cancelled
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return false;
  }
}

// Navigate to Google Maps / Waze
export function openMapsNavigation(lat: number, lng: number, label: string, provider: 'google' | 'waze' | 'apple' = 'google') {
  let url = '';
  if (provider === 'google') {
    url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  } else if (provider === 'waze') {
    url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  } else {
    url = `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
  }
  window.open(url, '_blank');
}
