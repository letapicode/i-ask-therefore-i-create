import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import Chart from 'chart.js/auto';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function Performance() {
  const [app, setApp] = useState('');
  const [range, setRange] = useState(24);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const { data } = useSWR(
    `/analytics/performance?app=${app}&range=${range}`,
    fetcher,
    { refreshInterval: 5000 }
  );
  const { data: alerts } = useSWR(`/analytics/alerts?app=${app}`, fetcher, {
    refreshInterval: 5000,
  });

  useEffect(() => {
    if (!data || !chartRef.current) return;
    const metrics: Record<string, { labels: string[]; data: number[] }> = {};
    for (const e of data) {
      const m = e.metric || 'value';
      if (!metrics[m]) metrics[m] = { labels: [], data: [] };
      metrics[m].labels.push(new Date(e.time).toLocaleTimeString());
      metrics[m].data.push(e.value);
    }
    const labels = metrics[Object.keys(metrics)[0]]?.labels || [];
    const datasets = Object.entries(metrics).map(([m, d]) => ({
      label: m,
      data: d.data,
      fill: false,
      borderColor: 'rgba(75,192,192,1)',
    }));
    const chart = new Chart(chartRef.current, {
      type: 'line',
      data: { labels, datasets },
    });
    return () => chart.destroy();
  }, [data]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Performance Metrics</h1>
      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="App ID"
          value={app}
          onChange={(e) => setApp(e.target.value)}
        />
        <input
          type="number"
          style={{ marginLeft: 10 }}
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
        />
      </div>
      <canvas ref={chartRef} height={200}></canvas>
      {!alerts && <p>Loading alerts...</p>}
      {alerts && alerts.length > 0 && (
        <ul>
          {alerts.map((a: any, i: number) => (
            <li key={i} style={{ color: 'red' }}>
              {a.metric} high at {a.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
