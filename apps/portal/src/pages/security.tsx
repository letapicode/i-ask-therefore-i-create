import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function Security() {
  const { data: reports } = useSWR('/analytics/securityReports', fetcher);
  const { data: compliance } = useSWR('/analytics/complianceReport?region=us', fetcher);
  return (
    <div style={{ padding: 20 }}>
      <h1>Security & Compliance</h1>
      {!reports && <p>Loading reports...</p>}
      {reports && (
        <table>
          <thead>
            <tr><th>Project</th><th>Vulnerabilities</th></tr>
          </thead>
          <tbody>
            {reports.map((r: any) => (
              <tr key={r.project}>
                <td>{r.project}</td>
                <td>{r.vulnerabilities}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {compliance && (
        <div style={{ marginTop: 20 }}>
          <h2>Policy</h2>
          <p>Region: {compliance.region}</p>
          <p>Retention: {compliance.retentionDays} days</p>
          <p>Total events: {compliance.totalEvents}</p>
          <p>Stale events: {compliance.staleEvents}</p>
        </div>
      )}
    </div>
  );
}
