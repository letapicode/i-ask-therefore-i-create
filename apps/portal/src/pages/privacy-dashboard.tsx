import { useRef, useEffect } from 'react';
import useSWR from 'swr';
import Chart from 'chart.js/auto';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function PrivacyDashboard() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const { data } = useSWR('/api/privacyStats', fetcher, {
    refreshInterval: 5000,
  });

  useEffect(() => {
    if (!data || !chartRef.current) return;
    const labels = data.map((d: any) => new Date(d.time).toLocaleTimeString());
    const noise = data.map((d: any) => d.noise);
    const updates = data.map((d: any) => d.updates);
    const opts = data.map((d: any) => d.optedIn);
    const chart = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Noise', data: noise, borderColor: 'blue', fill: false },
          {
            label: 'Updates',
            data: updates,
            borderColor: 'green',
            fill: false,
          },
          { label: 'Opted In', data: opts, borderColor: 'orange', fill: false },
        ],
      },
    });
    return () => chart.destroy();
  }, [data]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Federated Privacy Metrics</h1>
      <canvas ref={chartRef} height={200}></canvas>
    </div>
  );
}
