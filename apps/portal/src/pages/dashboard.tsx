import { useRef, useEffect } from 'react';
import useSWR from 'swr';
import Chart from 'chart.js/auto';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function Dashboard() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const { data } = useSWR('/analytics/summary', fetcher);

  useEffect(() => {
    if (!data || !chartRef.current) return;
    const labels = Object.keys(data);
    const chart = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Event Counts',
            data: Object.values(data) as number[],
            backgroundColor: 'rgba(54,162,235,0.5)',
          },
        ],
      },
    });
    return () => chart.destroy();
  }, [data]);

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      {!data && <p>Loading...</p>}
      <canvas ref={chartRef} height={200}></canvas>
      <p>
        <a href="/artifacts/sbom.json" target="_blank">
          Download SBOM
        </a>
      </p>
    </div>
  );
}
