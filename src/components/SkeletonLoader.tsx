import { motion } from 'framer-motion';

export function SkeletonCard() {
  return (
    <div className="p-5 rounded-3xl bg-white border border-slate-100 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
          <div className="h-3 bg-slate-100 rounded-lg w-1/3" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonOrder() {
  return (
    <div className="p-5 rounded-3xl bg-white border border-slate-100 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-6 bg-slate-100 rounded-xl w-20" />
        <div className="h-5 bg-slate-100 rounded-lg w-16" />
      </div>
      <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="p-5 rounded-3xl bg-white border border-slate-100 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-slate-100 mb-3" />
          <div className="h-6 bg-slate-100 rounded-lg w-16 mb-1" />
          <div className="h-3 bg-slate-100 rounded-lg w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-100 rounded-lg" style={{ width: `${100 - (i % 3) * 20}%` }} />
      ))}
    </div>
  );
}
