"use client";
import { useState } from "react";
import { api } from "@/lib/client";

export default function AdminLogin({ admin, onChange }: { admin: boolean; onChange: (admin: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return setError("Enter the password.");
    setBusy(true);
    setError(null);
    try {
      await api("/api/auth", { method: "POST", body: { password } });
      setPassword("");
      setOpen(false);
      onChange(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t log in.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await api("/api/auth", { method: "DELETE" }).catch(() => {});
    onChange(false);
  }

  return (
    <footer className="adminbar">
      {admin ? (
        <p>Logged in as Jack · <button type="button" className="linkbtn" onClick={logout}>Log out</button></p>
      ) : open ? (
        <form className="adminform" onSubmit={login}>
          <label htmlFor="admin-pass">Jack’s password</label>
          <input id="admin-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={busy} />
          <button type="submit" className="btn small" disabled={busy}>{busy ? "…" : "Log in"}</button>
          <button type="button" className="linkbtn" onClick={() => { setOpen(false); setError(null); }}>Cancel</button>
          {error && <p className="jerror" role="alert">{error}</p>}
        </form>
      ) : (
        <button type="button" className="linkbtn" onClick={() => setOpen(true)}>Jack’s login</button>
      )}
    </footer>
  );
}
