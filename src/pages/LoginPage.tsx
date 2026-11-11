import { useState, type SubmitEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../lib/api";
import { Feedback } from "../components/Feedback";
export function LoginPage() {
  const auth = useAuth(),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await auth.login(email, password);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="ted-login">
      <section className="card ted-card">
        <div className="section-kicker">TED INTAKE</div>
        <h1>เข้าสู่ระบบเจ้าหน้าที่</h1>
        <p>รับเอกสารและพิจารณา TED IDEA / TED POC</p>
        {auth.connectionError && (
          <div className="notice error">
            <p>ยังเชื่อมต่อ backend ไม่ได้ กรุณาเปิดบริการและตรวจไฟล์ตั้งค่า</p>
            <button type="button" onClick={auth.reload}>
              เชื่อมต่ออีกครั้ง
            </button>
          </div>
        )}
        <form onSubmit={submit}>
          <label>
            อีเมล
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            รหัสผ่าน
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <Feedback error={error} />
          <button className="button primary" disabled={busy}>
            {busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
          </button>
        </form>
      </section>
    </main>
  );
}
