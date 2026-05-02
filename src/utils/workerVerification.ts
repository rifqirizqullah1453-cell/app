import type { UserProfile } from '@/types';

const VERIFIED_STORAGE_KEY = 'boh_verified_workers';

export interface VerifiedWorker {
  workerId: string;
  verifiedAt: number;
  verifiedBy: string;
}

export function getVerifiedWorkers(): VerifiedWorker[] {
  try {
    const stored = localStorage.getItem(VERIFIED_STORAGE_KEY);
    return stored ? JSON.parse(stored) : getDefaultVerified();
  } catch {
    return getDefaultVerified();
  }
}

function getDefaultVerified(): VerifiedWorker[] {
  return [
    { workerId: 'demo-worker-001', verifiedAt: Date.now(), verifiedBy: 'admin' },
  ];
}

export function isWorkerVerified(workerId: string): boolean {
  return getVerifiedWorkers().some(v => v.workerId === workerId);
}

export function verifyWorker(workerId: string, adminId: string) {
  const verified = getVerifiedWorkers();
  if (!verified.some(v => v.workerId === workerId)) {
    verified.push({ workerId, verifiedAt: Date.now(), verifiedBy: adminId });
    localStorage.setItem(VERIFIED_STORAGE_KEY, JSON.stringify(verified));
  }
}

export function revokeVerification(workerId: string) {
  const verified = getVerifiedWorkers().filter(v => v.workerId !== workerId);
  localStorage.setItem(VERIFIED_STORAGE_KEY, JSON.stringify(verified));
}
