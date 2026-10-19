import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Notice from "../components/Notice";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/dashboard")
      .then(({ data }) => { if (active) setSummary(data); })
      .catch(() => { if (active) setError("Unable to load dashboard data."); });
    return () => { active = false; };
  }, []);

  const cards = [
    ["Total Requests", summary?.total_requests],
    ["Pending", summary?.pending_requests],
    ["In Progress", summary?.in_progress_requests],
    ["Ready for Release", summary?.ready_requests],
    ["Active Document Types", summary?.document_types],
  ];

  return (
    <>
      <div className="page-heading">
        <div><h2>Dashboard</h2><p>Current document request summary.</p></div>
        <Link className="button button-primary" to="/requests/new">+ New Request</Link>
      </div>
      <Notice message={error} kind="error" />
      {!summary ? <p role="status">Loading dashboard...</p> : (
        <div className="stats-grid">
          {cards.map(([label, value]) => <div className="stat-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}
        </div>
      )}
      <section className="panel">
        <h3>Quick links</h3>
        <p><Link to="/requests">View requests</Link> · <Link to="/document-types">Browse document types</Link></p>
      </section>
    </>
  );
}
