// ophthalmology-device-service-platform/backend/src/services/anomalyAgent.js

// Agent 1 – Rule-based thresholds
export function ruleBased(metric, value) {
  const limits = { temp: { min: 10, max: 45 }, vibration: { max: 0.8 }, power_draw: { max: 150 } };
  const cfg = limits[metric];
  if (!cfg) return null;
  if (value < (cfg.min || -Infinity)) return 'Below minimum threshold';
  if (value > cfg.max) return 'Above maximum threshold';
  return null;
}

// Agent 2 – Z-score outlier (window last 20 points)
export function zScoreOutlier(metric, history) {
  const arr = history.filter(p => p.metric === metric).map(p => p.value).slice(-20);
  if (arr.length < 10) return null;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const std = Math.sqrt(arr.map(v => (v - mean) ** 2).reduce((a, b) => a + b, 0) / arr.length);
  const last = arr[arr.length - 1];
  const z = Math.abs((last - mean) / std);
  if (z > 2.5) return `Z-score ${z.toFixed(1)} > 2.5 (outlier)`;
  return null;
}

// Agent 3 – Simple linear trend (slope > threshold)
export function trendBreak(metric, history) {
  const arr = history.filter(p => p.metric === metric).slice(-10);
  if (arr.length < 5) return null;
  const n = arr.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = arr.reduce((s, p) => s + p.value, 0);
  const sumXY = arr.reduce((s, p, i) => s + i * p.value, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX * sumX - sumX * sumX);
  if (Math.abs(slope) > 0.8) return `Sharp trend slope ${slope.toFixed(2)}`;
  return null;
}

// Main wrapper
export function analyseAnomalies(deviceId, history) {
  const metrics = [...new Set(history.map(p => p.metric))];
  const report = {};
  for (const m of metrics) {
    const pts = history.filter(p => p.metric === m);
    const last = pts[pts.length - 1];
    report[m] = {
      latest: last.value,
      alerts: [
        ruleBased(m, last.value),
        zScoreOutlier(m, history),
        trendBreak(m, history)
      ].filter(Boolean)
    };
  }
  return report;
}