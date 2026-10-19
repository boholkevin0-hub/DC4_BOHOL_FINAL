import { Link } from "react-router-dom";
import Button from "./Button";

const STATUSES = ["Pending", "Approved", "Processing", "Ready for Release", "Completed"];

export default function RequestTable({ requests, isAdmin, onStatusChange, onDelete }) {
  if (!requests.length) return <p className="empty-state">No document requests found.</p>;

  return (
    <div className="table-wrapper">
      <table>
        <thead><tr><th>Student</th><th>Document</th><th>Purpose</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>{request.student_name}</td>
              <td>{request.document_type}</td>
              <td>{request.purpose}</td>
              <td>{request.date_submitted || "—"}</td>
              <td><span className={`status status-${request.status.toLowerCase().replaceAll(" ", "-")}`}>{request.status}</span></td>
              <td className="action-cell">
                {isAdmin ? (
                  <>
                    <select aria-label={`Update status for ${request.student_name}`} value={request.status} onChange={(event) => onStatusChange(request.id, event.target.value)}>
                      {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <Button type="button" variant="danger" onClick={() => onDelete(request.id)}>Delete</Button>
                  </>
                ) : <Link className="button button-secondary" to={`/requests/${request.id}/edit`}>Edit</Link>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
