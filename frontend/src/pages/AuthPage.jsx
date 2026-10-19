import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Field from "../components/Field";
import Notice from "../components/Notice";
import BrandMark from "../components/BrandMark";
import { useAuth } from "../context/useAuth";

function firstError(errors, field) {
  return errors[field]?.[0];
}

export default function AuthPage({ register = false }) {
  const title = register ? "Create student account" : "Sign in";
  const { login, register: createAccount, authError } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(authError || "");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setErrors({});
    setNotice("");
    setSaving(true);
    try {
      if (register) await createAccount(form);
      else await login({ email: form.email, password: form.password });
      navigate("/", { replace: true });
    } catch (error) {
      setErrors(error.response?.data?.errors || {});
      setNotice(error.response?.data?.message || "Unable to sign in. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="panel auth-panel">
        <BrandMark />
        <h1>{title}</h1>
        <p>Student Document Portal</p>
        <Notice message={notice} kind="error" />
        <form onSubmit={submit}>
          {register && <Field label="Full name" name="name" value={form.name} onChange={handleChange} autoComplete="name" required maxLength={255} error={firstError(errors, "name")} />}
          <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" required error={firstError(errors, "email")} />
          <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} autoComplete={register ? "new-password" : "current-password"} required minLength={register ? 8 : undefined} error={firstError(errors, "password")} />
          {register && <Field label="Confirm password" name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} autoComplete="new-password" required minLength={8} error={firstError(errors, "password_confirmation")} />}
          <Button type="submit" disabled={saving}>{saving ? "Please wait..." : register ? "Create account" : "Sign in"}</Button>
        </form>
        <p className="auth-switch">{register ? "Already registered?" : "Need a student account?"}{" "}
          <Link to={register ? "/login" : "/register"}>{register ? "Sign in" : "Register"}</Link>
        </p>
      </section>
    </main>
  );
}
