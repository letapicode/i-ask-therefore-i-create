import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import Chart from 'chart.js/auto';

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function A11yScore() {
  const [project, setProject] = useState('');
  const { data } = useSWR(
    `/analytics/a11yScore?project=${encodeURIComponent(project)}`,
    fetcher
  );
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!data || !chartRef.current) return;
    const labels = data.map((d: any) => new Date(d.time).toLocaleDateString());
    const scores = data.map((d: any) => d.score);
    const chart = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Score', data: scores, fill: false, borderColor: 'blue' },
        ],
      },
    });
    return () => chart.destroy();
  }, [data]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Accessibility Score</h1>
      <input
        placeholder="Project"
        value={project}
        onChange={(e) => setProject(e.target.value)}
      />
      <canvas ref={chartRef} height={200}></canvas>
    </div>
  );
}
