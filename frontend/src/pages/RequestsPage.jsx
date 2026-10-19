import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import api from "../api";
import Notice from "../components/Notice";
import Pagination from "../components/Pagination";
import RequestTable from "../components/RequestTable";

function getMessage(error, fallback) {
  return error.response?.data?.message || fallback;
}

export default function RequestsPage({ adminView = false }) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState(null);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(location.state?.notice || "");
  const [noticeKind, setNoticeKind] = useState(location.state?.notice ? "success" : "info");

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/document-requests", {
          params: { search: search || undefined, status: status || undefined, page, per_page: 10 },
        });
        if (active) {
          setRequests(data.data);
          setMeta(data.meta);
        }
      } catch (error) {
        if (active) {
          setNotice(getMessage(error, "Unable to load document requests."));
          setNoticeKind("error");
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [search, status, page, refreshKey]);

  function updateQuery(key, value, resetPage = false) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      if (resetPage) next.delete("page");
      return next;
    }, { replace: true });
  }

  async function updateStatus(id, newStatus) {
    try {
      await api.patch(`/document-requests/${id}/status`, { status: newStatus });
      setNotice("Request status updated.");
      setNoticeKind("success");
      setRefreshKey((current) => current + 1);
    } catch (error) {
      setNotice(getMessage(error, "Unable to change request status."));
      setNoticeKind("error");
    }
  }

  async function deleteRequest(id) {
    if (!window.confirm("Delete this document request? This cannot be undone.")) return;
    try {
      await api.delete(`/document-requests/${id}`);
      setNotice("Request deleted.");
      setNoticeKind("success");
      if (meta?.total && (meta.total - 1) <= (page - 1) * 10) {
        updateQuery("page", page > 1 ? String(page - 1) : "", false);
      } else {
        setRefreshKey((current) => current + 1);
      }
    } catch (error) {
      setNotice(getMessage(error, "Unable to delete request."));
      setNoticeKind("error");
    }
  }

  return (
    <>
      <div className="page-heading">
        <div><h2>{adminView ? "Manage Requests" : "My Requests"}</h2><p>{adminView ? "Review and process student document requests." : "Search, filter, and update your requests."}</p></div>
        {!adminView && <Link className="button button-primary" to="/requests/new">+ New Request</Link>}
      </div>
      <Notice message={notice} kind={noticeKind} onDismiss={() => setNotice("")} />
      <section className="panel">
        <div className="filter-row">
          <label>Search<input className="search-input" value={search} onChange={(event) => updateQuery("search", event.target.value, true)} placeholder="Name, purpose, or document type" /></label>
          <label>Status<select value={status} onChange={(event) => updateQuery("status", event.target.value, true)}>
            <option value="">All statuses</option>
            {["Pending", "Approved", "Processing", "Ready for Release", "Completed"].map((item) => <option key={item}>{item}</option>)}
          </select></label>
        </div>
        {loading ? <p role="status">Loading requests...</p> : (
          <>
            <RequestTable requests={requests} isAdmin={adminView} onStatusChange={updateStatus} onDelete={deleteRequest} />
            <Pagination meta={meta} onPageChange={(nextPage) => updateQuery("page", String(nextPage))} />
          </>
        )}
        {adminView && <p className="muted-note">Student accounts can view and edit their own requests. Administrators can change statuses and delete requests.</p>}
      </section>
    </>
  );
}
