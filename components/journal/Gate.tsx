"use client";
import { useState } from "react";
import { PEOPLE } from "@/lib/people";
import { api, type Session } from "@/lib/client";

export default function Gate({ onEnter, notice }: { onEnter: (s: Session) => void; notice: string | null }) {
  const [user, setUser] = useState<string>("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(notice);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return setError("Pick who you are.");
    if (!pass) return setError("Enter the trip passcode.");
    setBusy(true);
    setError(null);
    try {
      await api("/api/auth", { user, pass }, { method: "POST" });
      onEnter({ user, pass });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="gate">
      <div className="eyebrow">Journal</div>
      <h1>Diario</h1>
      <p className="lede">For the four of us only. Pick your name and enter the trip passcode. This device will remember you.</p>
      <form onSubmit={submit} className="gateform">
        <fieldset>
          <legend>Who are you?</legend>
          <div className="whogrid">
            {PEOPLE.map((p) => (
              <label key={p.name} className="who" style={{ ["--pc" as string]: p.color }}>
                <input type="radio" name="who" id={`who-${p.name}`} value={p.name} checked={user === p.name} onChange={() => setUser(p.name)} />
                <span className="avatar">{p.name[0]}</span>
                <span>{p.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="field">
          <span>Trip passcode</span>
          <input id="gate-pass" type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} />
        </label>
        {error && <p className="jerror" role="alert">{error}</p>}
        <button type="submit" className="btn" disabled={busy}>{busy ? "Checking…" : "Open the journal"}</button>
      </form>
    </section>
  );
}
