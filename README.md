# TED Intake frontend

React + TypeScript + Vite ระบบรับเอกสาร TED โดยเจ้าหน้าที่

## เริ่มในเครื่อง

1. Node 24.x / npm 11.x
2. `npm ci`
3. เปิด backend ที่พอร์ต 4100 หลังตั้งค่าฐาน TED และสร้างบัญชีตาม README backend
4. `npm run dev` แล้วเปิด http://localhost:5174

Vite proxy `/api` และ `/healthz` ไป backend; ไม่ต้องตั้ง VITE_API_BASE_URL ในเครื่อง และห้ามใส่ secret ในตัวแปร VITE_ เพราะถูกเผยแพร่ใน bundle

## การใช้งาน

1. เข้าสู่ระบบด้วยบัญชี TED ที่สร้างในฐานใหม่
2. รับเอกสารใหม่ → ชื่อโครงการ + ที่มาของสิทธิ์ + ยืนยันอนุญาตส่งข้อความให้ Groq
3. เลือก/วางไฟล์หนึ่งไฟล์ ระบบอัปโหลด อ่าน และวิเคราะห์อัตโนมัติ ไม่ต้องกดประมวลผลอีก
4. ตรวจชนิดแบบฟอร์มที่ระบบพบ ความครอบคลุมรายหัวข้อ แล้วอ่านผลแนะนำและคำถามเพิ่มเติมที่แยก IDEA/POC/เงินสมทบ
5. กดลิงก์หลักฐานเพื่อเลื่อนไปยังข้อความที่ AI ใช้ และเทียบไฟล์ต้นฉบับ
6. เติมข้อมูลเจ้าหน้าที่เท่าที่จำเป็นแล้วบันทึก ระบบวิเคราะห์รุ่นใหม่อัตโนมัติ
7. เลือกผลของเจ้าหน้าที่ ระบุเหตุผล ตรวจยืนยัน แล้วบันทึก

เอกสารยาวใช้ข้อความที่คัดเลือก ไม่ได้วิเคราะห์ครบทุกหน้าเสมอ หน้าจอจะแสดง coverage และข้อจำกัด PDF/DOCX ไม่มี OCR ไม่มีคะแนน และไม่รับรองสิทธิ์ทุน

## โครงสร้าง

- `pages`: login, list, upload, detail
- `components/analysis`: ผล TED, แหล่งข้อความ, ข้อมูลที่สกัด/แก้ไข, ผลพิจารณา
- `context/AuthContext.tsx`: session ของเจ้าหน้าที่
- `lib/api.ts`: HTTP, CSRF header, cookie, error
- `types`: รูปแบบข้อมูลร่วมของหน้าเว็บ
- `index.css`: รูปแบบที่นำกลับมาใช้; `ted.css`: ส่วนเฉพาะ TED

ตรวจ `npm run build` และ `npm run lint`

## Vercel

- repository นี้เป็น frontend แยก จึงใช้ Root Directory ที่ root ของ repo
- Vite / build `npm run build` / output `dist`
- เว้น VITE_API_BASE_URL ว่าง ใช้ **same-origin proxy** เพื่อให้ cookie HttpOnly/SameSite=Lax ทำงาน
- คัดลอก `vercel.json.example` เป็น `vercel.json` แล้วเปลี่ยน `YOUR-TED-BACKEND.onrender.com` เป็น backend TED ใหม่ของตน ก่อน deploy
- backend APP_ORIGIN ต้องตรง URL frontend HTTPS ไม่มี slash ท้าย
- อย่าเชื่อม backend เดิมของ Scouting; ถ้าใช้ URL backend ต่างโดเมนโดยตรง cookie Lax รุ่นนี้จะไม่รองรับ cross-site login

ยังไม่ได้ตั้งโดเมนหรือ deploy ระบบ TED ให้ในการพัฒนารอบนี้

ตัวอ่านรุ่นใหม่แนะนำ DOCX เป็นหลัก เพราะเก็บตารางและหัวคอลัมน์ได้ตรงกว่า PDF แบบฟอร์มเปล่าจะขึ้น “ยังไม่ได้เรียก AI” ให้ใช้ไฟล์ที่กรอกแล้วหรือเติมข้อมูลเจ้าหน้าที่ เคสที่เคยวิเคราะห์ด้วยรุ่นก่อนต้องกดวิเคราะห์ใหม่ ไม่ต้องอัปโหลดซ้ำ
