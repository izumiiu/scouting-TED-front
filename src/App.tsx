import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import type { Catalog } from "./types";
import { api, errorMessage } from "./lib/api";
import { LoginPage } from "./pages/LoginPage";
import { CaseListPage } from "./pages/CaseListPage";
import { CaseDetailPage } from "./pages/CaseDetailPage";
import { UploadPage } from "./pages/UploadPage";
import { Feedback } from "./components/Feedback";
function Workspace() {
  const auth = useAuth(),
    [hash, setHash] = useState(window.location.hash),
    [catalog, setCatalog] = useState<Catalog | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    const change = () => setHash(window.location.hash);
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    let live = true;
    if (auth.user)
      api<Catalog>("/catalog")
        .then((v) => {
          if (live) setCatalog(v);
        })
        .catch((e) => {
          if (live) setError(errorMessage(e));
        });
    return () => {
      live = false;
    };
  }, [auth.user]);
  if (auth.loading)
    return <main className="ted-shell">กำลังตรวจการเข้าสู่ระบบ…</main>;
  if (!auth.user) return <LoginPage />;
  const id = hash.match(/^#\/cases\/([a-f\d]{24})$/i)?.[1];
  return (
    <>
      <header className="ted-header">
        <a href="#/" className="brand">
          TED INTAKE
        </a>
        <nav>
          <a href="#/">โครงการ</a>
          <a href="#/new">รับเอกสารใหม่</a>
        </nav>
        <span>{auth.user.name}</span>
        <button
          onClick={() =>
            void auth.logout().catch((e) => setError(errorMessage(e)))
          }
        >
          ออกจากระบบ
        </button>
      </header>
      <main className="ted-shell">
        <Feedback error={error} />
        {!catalog ? (
          <p>
            {error
              ? "โหลดการตั้งค่าไม่ได้ กรุณารีเฟรชหลังตรวจ backend"
              : "กำลังโหลดการตั้งค่า…"}
          </p>
        ) : id ? (
          <CaseDetailPage key={id} id={id} catalog={catalog} />
        ) : hash === "#/new" ? (
          <UploadPage catalog={catalog} />
        ) : (
          <CaseListPage />
        )}
      </main>
    </>
  );
}
export default function App() {
  return (
    <AuthProvider>
      <Workspace />
    </AuthProvider>
  );
}
