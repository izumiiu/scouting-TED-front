import { useEffect, useState } from 'react';
import type { Catalog } from './types';
export default function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
    fetch(`${base}/api/catalog`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('ยังเชื่อมต่อบริการไม่ได้');
        setCatalog((await response.json()) as Catalog);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError('ยังเชื่อมต่อบริการไม่ได้ กรุณาเปิด backend');
      });
    return () => controller.abort();
  }, []);
  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div className="page-heading">
        <div>
          <div className="section-kicker">TED INTAKE</div>
          <h1>พื้นที่วิเคราะห์โครงการ TED</h1>
          <p>TED IDEA / TED POC</p>
        </div>
      </div>
      <section className="card" style={{ padding: '1.5rem' }}>
        <h2>เตรียมระบบแล้ว</h2>
        <p>พื้นที่รับเอกสารและวิเคราะห์อัตโนมัติอยู่ระหว่างพัฒนา</p>
        {error ? (
          <p role="alert">{error}</p>
        ) : !catalog ? (
          <p>กำลังเชื่อมต่อบริการ…</p>
        ) : (
          <>
            <p>เชื่อมต่อบริการสำเร็จ</p>
            <div className="tag-list">
              {catalog.programs.map((program) => (
                <span className="badge status-draft" key={program.code}>
                  {program.label}
                </span>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
