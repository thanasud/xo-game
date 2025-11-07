# XO Game

- Tech: Next.js, TypeScript, Tailwind CSS, MongoDB

## FEATURES

- ปรับขนาดกระดาน: UI รองรับ 3–10 (ฝั่ง logic/API รองรับมากกว่านี้ได้)
- เก็บประวัติ: บันทึกตาเดิน, เวลาที่เดิน, ผลลัพธ์ (ชนะ/เสมอ)
- Replay: เปิดดูเกมย้อนหลัง พร้อมปุ่มควบคุม (First/Prev/Play/Next/Last) และคีย์ลัด ← → Space
- Bot ที่สามารถเล่นอัตโนมัติได้


## SETUP

สร้างไฟล์ `.env.local` ที่โฟลเดอร์โปรเจกต์
```
MONGODB_URI=<your mongodb connection string>
MONGODB_DB=xo-game
```

ตัวอย่าง (MongoDB Atlas)
```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_DB=xo-game
```

## HOW TO RUN

- Node.js ≥ 18.18
- ติดตั้งแพ็กเกจ: `pnpm i` (หรือ `npm i`)
- รัน: `pnpm run dev` (หรือ `npm run dev`)
- เปิด: http://localhost:3000


## โครงสร้างโปรเจกต์

- `app/page.tsx` — หน้าเกมหลัก (Board + Controls + Recent)
- `app/replay/[id]/page.tsx` — หน้า Replay (slider + ปุ่มควบคุม + คีย์ลัด)
- `app/components/Board.tsx` — UI กระดาน NxN
- `app/components/GameList.tsx` — รายการ Recent (scroll ได้, ปุ่ม Refresh)
- `app/api/games/*` — REST API (create/list/get/append move/finish)
- `lib/logic.ts` — Core logic (เช็คผู้ชนะ NxN + บอท heuristic)
- `lib/api.ts` — Client helpers สำหรับเรียก API ฝั่งเบราว์เซอร์
- `lib/mongo.ts` — MongoDB connector helpers
- `lib/types.ts` — Type ของ Game/Move/Result


## Algorithm

Winner check (NxN)
- ตรวจทุกแถว/คอลัมน์/ทแยงหลัก/ทแยงรอง หากพบสัญลักษณ์เดียวกันครบทั้งเส้น → ชนะ

Bot (Heuristic)
- ลำดับการตัดสินใจ:
  1) ลงแล้วชนะได้ → ลง
  2) คู่แข่งลงแล้วจะชนะ → บล็อก
  3) กลางกระดานว่าง → ลง
  4) ไม่เข้าเงื่อนไข → สุ่มหนึ่งช่องว่าง

Draw
- ไม่มีผู้ชนะและกระดานเต็ม → เสมอ

— END —
