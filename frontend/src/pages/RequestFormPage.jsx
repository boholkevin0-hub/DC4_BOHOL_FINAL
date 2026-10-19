import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import Button from "../components/Button";
import Field from "../components/Field";
import Notice from "../components/Notice";
import { useAuth } from "../context/useAuth";

export default function RequestFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const draftKey = `document-request-draft-${user.id}`;
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState(() => {
    if (!id) {
      try {
        const draft = localStorage.getItem(draftKey);
        if (draft) {
          const saved = JSON.parse(draft);
          if (
            saved &&
            typeof saved === "object" &&
            !Array.isArray(saved) &&
            typeof saved.student_name === "string" &&
            typeof saved.purpose === "string"
          ) {
            return {
              student_name: saved.student_name,
              document_type_id: String(saved.document_type_id || ""),
              purpose: saved.purpose,
            };
          }
        }
      } catch {
        localStorage.removeItem(draftKey);
      }
    }

    return { student_name: user.name || "", document_type_id: "", purpose: "" };
  });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get("/document-types"),
      id ? api.get(`/document-requests/${id}`) : Promise.resolve(null),
    ]).then(([typeResponse, requestResponse]) => {
      if (!active) return;
      setTypes(typeResponse.data.data);
      if (requestResponse) {
        const request = requestResponse.data.data;
        setForm({
          student_name: request.student_name,
          document_type_id: String(request.document_type_id || ""),
          purpose: request.purpose,
        });
      } else if (typeResponse.data.data.length) {
        setForm((current) => ({
          ...current,
          document_type_id: current.document_type_id || String(typeResponse.data.data[0].id),
        }));
      }
    }).catch((error) => {
      if (active) setNotice(error.response?.data?.message || "Unable to load the request form.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  function change(event) {
    const nextForm = { ...form, [event.target.name]: event.target.value };
    setForm(nextForm);
    setErrors((current) => ({ ...current, [event.target.name]: undefined }));
    if (!id) {
      try {
        localStorage.setItem(draftKey, JSON.stringify(nextForm));
      } catch {
        setNotice("Your draft could not be saved in this browser.");
      }
    }
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    setNotice("");
    const payload = { ...form, document_type_id: Number(form.document_type_id) };
    try {
      if (id) await api.put(`/document-requests/${id}`, payload);
      else await api.post("/document-requests", payload);
      if (!id) localStorage.removeItem(draftKey);
      navigate("/requests", { state: { notice: id ? "Request updated." : "Request submitted." } });
    } catch (error) {
      setErrors(error.response?.data?.errors || {});
      setNotice(error.response?.data?.message || "Unable to save this request.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p role="status">Loading request...</p>;

  return (
    <>
      <div className="page-heading"><div><h2>{id ? "Edit Request" : "Request a Document"}</h2><p>Submit or update a student document request.</p></div><Link to="/requests">Back to requests</Link></div>
      <section className="panel form-panel">
        <Notice message={notice} kind="error" />
        {loading ? <p role="status">Loading request form...</p> : !types.length ? <p>No document types are currently available.</p> : (
          <form onSubmit={submit}>
            <Field label="Student name" name="student_name" value={form.student_name} onChange={change} required maxLength={255} error={errors.student_name?.[0]} />
            <Field label="Document type" name="document_type_id" as="select" value={form.document_type_id} onChange={change} required error={errors.document_type_id?.[0]}>
              {types.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
            </Field>
            <Field label="Purpose" name="purpose" as="textarea" value={form.purpose} onChange={change} required maxLength={2000} rows={4} error={errors.purpose?.[0]} />
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : id ? "Save changes" : "Submit request"}</Button>
            {!id && <p className="draft-hint">Your unfinished request is saved in this browser and restored after a refresh.</p>}
          </form>
        )}
      </section>
    </>
  );
}
