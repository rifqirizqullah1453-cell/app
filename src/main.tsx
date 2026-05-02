import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { TRPCProvider } from "@/providers/trpc"
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { OrderProvider } from './contexts/OrderContext';

// Hide loading indicator once React mounts
const hideLoading = () => {
  const el = document.getElementById('initial-loading');
  if (el) el.style.display = 'none';
};

try {
  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');

  createRoot(root).render(
    <BrowserRouter>
      <TRPCProvider>
        <AuthProvider>
          <OrderProvider>
            <App />
          </OrderProvider>
        </AuthProvider>
      </TRPCProvider>
    </BrowserRouter>
  );

  hideLoading();
} catch (err) {
  console.error('Failed to start app:', err);
  hideLoading();
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;padding:24px;background:#F0FAFB;font-family:sans-serif;">
        <div style="text-align:center;max-width:320px;">
          <div style="width:64px;height:64px;border-radius:50%;background:#E8F8FA;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">⚠️</div>
          <h1 style="font-size:18px;font-weight:900;color:#2BC5D4;margin-bottom:8px;">App failed to load</h1>
          <p style="font-size:13px;color:#64748B;margin-bottom:16px;">Please try clearing your browser data and reload.</p>
          <button onclick="try{localStorage.clear()}catch(e){}window.location.reload()" 
            style="padding:12px 24px;border-radius:16px;border:none;background:linear-gradient(135deg,#4DD4E0,#2BC5D4);color:white;font-size:13px;font-weight:700;cursor:pointer;">
            Reload App
          </button>
        </div>
      </div>
    `;
  }
}
