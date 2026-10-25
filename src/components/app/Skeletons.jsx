import { Skeleton } from './ui';

/* Loading placeholders that mirror the real layouts, so nothing jumps when data arrives. */

export function CardSkeleton({ height = 220, title = true }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      {title && <Skeleton w={140} h={16} style={{ marginBottom: 20 }} />}
      <Skeleton h={height} r={12} />
    </div>
  );
}

export function StatsSkeleton({ count = 4 }) {
  return (
    <div className="stats-grid">
      {Array.from({ length: count }, (_, i) => (
        <div className="stat" key={i}>
          <Skeleton w={90} h={13} /><Skeleton w={150} h={28} style={{ marginTop: 6 }} /><Skeleton w={120} h={13} />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 6 }) {
  return (
    <div className="card" style={{ padding: '8px 0' }}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px' }}>
          <Skeleton w={38} h={38} r={12} />
          <div style={{ flex: 1, display: 'grid', gap: 6 }}><Skeleton w="45%" h={13} /><Skeleton w="28%" h={11} /></div>
          <Skeleton w={70} h={14} />
        </div>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div style={{ marginBottom: 24, display: 'grid', gap: 8 }}>
      <Skeleton w={220} h={28} /><Skeleton w={320} h={14} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <PageHeaderSkeleton />
      <StatsSkeleton />
      <div className="dash-grid" style={{ marginTop: 24 }}>
        <div className="dash-grid__wide"><CardSkeleton height={260} /></div>
        <CardSkeleton height={220} />
      </div>
      <div className="dash-grid" style={{ marginTop: 24 }}>
        <div className="dash-grid__wide"><ListSkeleton rows={5} /></div>
        <CardSkeleton height={220} />
      </div>
    </>
  );
}

export function GridSkeleton({ count = 6, height = 150 }) {
  return (
    <div className="card-grid">
      {Array.from({ length: count }, (_, i) => <CardSkeleton key={i} height={height} title={false} />)}
    </div>
  );
}
