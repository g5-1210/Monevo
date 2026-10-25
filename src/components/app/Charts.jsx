import { useEffect, useRef, useState } from 'react';

/* Dependency-free SVG charts. They size themselves to their container and read
   colors from CSS variables, so they follow the light/dark theme automatically. */

function useWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

const niceMax = (v) => {
  if (v <= 0) return 1000;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
};

function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const t = 0.18;
    d += ` C${p1.x + (p2.x - p0.x) * t},${p1.y + (p2.y - p0.y) * t} ${p2.x - (p3.x - p1.x) * t},${p2.y - (p3.y - p1.y) * t} ${p2.x},${p2.y}`;
  }
  return d;
}

/* ---------- Line / area chart (income vs expenses over time) ---------- */
export function TrendChart({ data, series, height = 260, format, compact }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const pad = { t: 12, r: 12, b: 28, l: compact ? 44 : 52 };
  const iw = Math.max(0, width - pad.l - pad.r);
  const ih = height - pad.t - pad.b;
  const max = niceMax(Math.max(...data.flatMap(d => series.map(s => d[s.key])), 0));
  const x = (i) => pad.l + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v) => pad.t + ih - (v / max) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => f * max);

  const setFromX = (clientX, el) => {
    const rel = clientX - el.getBoundingClientRect().left - pad.l;
    const i = Math.round((rel / (iw || 1)) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };
  const onTouch = (e) => { if (e.touches[0]) setFromX(e.touches[0].clientX, e.currentTarget); };

  return (
    <div className="chart" ref={ref} style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img"
          aria-label={`Trend chart: ${series.map(s => s.label).join(' and ')}`}
          onMouseMove={(e) => setFromX(e.clientX, e.currentTarget)} onMouseLeave={() => setHover(null)}
          onTouchStart={onTouch} onTouchMove={onTouch}>
          <defs>
            {series.map(s => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.18" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>
          {ticks.map(t => (
            <g key={t}>
              <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeDasharray={t === 0 ? undefined : '3 4'} />
              <text x={pad.l - 10} y={y(t) + 4} textAnchor="end" className="chart__tick">{format(t, true)}</text>
            </g>
          ))}
          {data.map((d, i) => (
            <text key={d.key} x={x(i)} y={height - 8} textAnchor="middle" className="chart__tick">{d.label}</text>
          ))}
          {series.map(s => {
            const pts = data.map((d, i) => ({ x: x(i), y: y(d[s.key]) }));
            const line = smoothPath(pts);
            return (
              <g key={s.key}>
                {s.area && pts.length > 1 && <path d={`${line} L${pts[pts.length - 1].x},${y(0)} L${pts[0].x},${y(0)} Z`} fill={`url(#grad-${s.key})`} />}
                <path d={line} fill="none" stroke={s.color} strokeWidth="2.25" strokeLinecap="round" strokeDasharray={s.dashed ? '5 5' : undefined} />
                {pts.length === 1 && <circle cx={pts[0].x} cy={pts[0].y} r="4" fill={s.color} />}
              </g>
            );
          })}
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="var(--text-muted)" strokeDasharray="3 3" opacity="0.6" />
              {series.map(s => (
                <circle key={s.key} cx={x(hover)} cy={y(data[hover][s.key])} r="4.5" fill="var(--surface)" stroke={s.color} strokeWidth="2.25" />
              ))}
            </g>
          )}
        </svg>
      )}
      {hover !== null && width > 0 && (
        <div className="chart__tip" style={{ left: Math.min(Math.max(x(hover), 70), width - 70) }}>
          <strong>{data[hover].label}</strong>
          {series.map(s => (
            <span key={s.key}><i style={{ background: s.color }} />{s.label}<b>{format(data[hover][s.key])}</b></span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Grouped bar chart ---------- */
export function BarChart({ data, series, height = 260, format }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const pad = { t: 12, r: 8, b: 28, l: 52 };
  const iw = Math.max(0, width - pad.l - pad.r);
  const ih = height - pad.t - pad.b;
  const max = niceMax(Math.max(...data.flatMap(d => series.map(s => d[s.key])), 0));
  const group = iw / data.length;
  const barW = Math.min(26, (group * 0.7) / series.length);
  const y = (v) => pad.t + ih - (v / max) * ih;

  return (
    <div className="chart" ref={ref} style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={`Bar chart: ${series.map(s => s.label).join(' and ')}`}>
          {[0, 0.25, 0.5, 0.75, 1].map(f => (
            <g key={f}>
              <line x1={pad.l} x2={width - pad.r} y1={y(f * max)} y2={y(f * max)} stroke="var(--border)" strokeDasharray={f === 0 ? undefined : '3 4'} />
              <text x={pad.l - 10} y={y(f * max) + 4} textAnchor="end" className="chart__tick">{format(f * max, true)}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = pad.l + group * i + group / 2;
            return (
              <g key={d.key} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <rect x={pad.l + group * i} y={pad.t} width={group} height={ih} fill="transparent" />
                {series.map((s, j) => {
                  const bx = cx - (barW * series.length) / 2 + j * barW + (j ? 2 : 0) - (series.length - 1);
                  const h = Math.max(0, (d[s.key] / max) * ih);
                  return <rect key={s.key} x={bx} y={pad.t + ih - h} width={barW - 2} height={h} rx="4" fill={s.color} opacity={hover === null || hover === i ? 1 : 0.45} />;
                })}
                <text x={cx} y={height - 8} textAnchor="middle" className="chart__tick">{d.label}</text>
              </g>
            );
          })}
        </svg>
      )}
      {hover !== null && width > 0 && (
        <div className="chart__tip" style={{ left: Math.min(Math.max(pad.l + group * hover + group / 2, 70), width - 70) }}>
          <strong>{data[hover].label}</strong>
          {series.map(s => (
            <span key={s.key}><i style={{ background: s.color }} />{s.label}<b>{format(data[hover][s.key])}</b></span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Donut ---------- */
export function DonutChart({ slices, size = 176, thickness = 20, centerLabel, centerValue }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = slices.reduce((s, x) => s + x.amount, 0);
  const gap = slices.length > 1 ? 3 : 0;
  let offset = 0;
  return (
    <div className="donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Spending by category">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={thickness} />
        {total > 0 && slices.map(s => {
          const len = (s.amount / total) * c;
          const el = (
            <circle key={s.id} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
              strokeDasharray={`${Math.max(0, len - gap)} ${c - Math.max(0, len - gap)}`} strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`} />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="donut__center">
        <span className="donut__label">{centerLabel}</span>
        <span className="donut__value">{centerValue}</span>
      </div>
    </div>
  );
}

/* ---------- Sparkline ---------- */
export function Sparkline({ values, width = 120, height = 36, color = 'currentColor' }) {
  if (values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => ({ x: (i / (values.length - 1)) * width, y: 4 + (height - 8) - ((v - min) / span) * (height - 8) }));
  const line = smoothPath(pts);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={`${line} L${width},${height} L0,${height} Z`} fill={color} opacity="0.14" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
