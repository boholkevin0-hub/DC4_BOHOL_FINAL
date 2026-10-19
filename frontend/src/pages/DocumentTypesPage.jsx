import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import api from "../api";
import Button from "../components/Button";
import Field from "../components/Field";
import Notice from "../components/Notice";

const blank = { name: "", description: "", is_active: true };

export default function DocumentTypesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadTypes() {
    const { data } = await api.get("/document-types");
    setTypes(data.data);
  }

  useEffect(() => {
    let active = true;
    api.get("/document-types").then(({ data }) => { if (active) setTypes(data.data); })
      .catch(() => { if (active) setNotice("Unable to load document types."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function change(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function submit(event) {
    event.preventDefault();
    setErrors({});
    try {
      if (editingId) await api.put(`/document-types/${editingId}`, form);
      else await api.post("/document-types", form);
      setForm(blank);
      setEditingId(null);
      setNotice("Document type saved.");
      await loadTypes();
    } catch (error) {
      setErrors(error.response?.data?.errors || {});
      setNotice(error.response?.data?.message || "Unable to save document type.");
    }
  }

  async function removeType(type) {
    if (!window.confirm(`Delete "${type.name}"?`)) return;
    try {
      await api.delete(`/document-types/${type.id}`);
      setNotice("Document type deleted.");
      await loadTypes();
    } catch (error) {
      setNotice(error.response?.data?.message || "Unable to delete document type.");
    }
  }

  return (
    <>
      <div className="page-heading"><div><h2>Document Types</h2><p>Available school documents that students can request.</p></div></div>
      <Notice message={notice} />
      {loading ? <p role="status">Loading document types...</p> : (
        <div className="document-grid">
          {types.map((type) => (
            <article className="document-card" key={type.id}>
              <div className="document-icon">▤</div><h3>{type.name}</h3><p>{type.description}</p>
              {isAdmin && <div className="type-actions">
                <Button type="button" variant="secondary" onClick={() => { setEditingId(type.id); setForm({ name: type.name, description: type.description || "", is_active: type.is_active }); }}>Edit</Button>
                <Button type="button" variant="danger" onClick={() => removeType(type)}>Delete</Button>
              </div>}
            </article>
          ))}
        </div>
      )}
      {isAdmin && <section className="panel form-panel">
        <h3>{editingId ? "Edit document type" : "Add document type"}</h3>
        <form onSubmit={submit}>
          <Field label="Name" name="name" value={form.name} onChange={change} required maxLength={255} error={errors.name?.[0]} />
          <Field label="Description" name="description" as="textarea" value={form.description} onChange={change} rows={3} error={errors.description?.[0]} />
          {editingId && <label className="checkbox-field"><input type="checkbox" name="is_active" checked={form.is_active} onChange={change} /> Available for new requests</label>}
          <div className="form-actions">
            <Button type="submit">{editingId ? "Save type" : "Add type"}</Button>
            {editingId && <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(blank); }}>Cancel</Button>}
          </div>
        </form>
      </section>}
    </>
  );
}
