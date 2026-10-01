# WU Canteen

เว็บแอปสำหรับดูเมนูอาหารของโรงอาหารมหาวิทยาลัยวลัยลักษณ์ และจัดการข้อมูลเมนูสำหรับพนักงาน พัฒนาด้วย Next.js และใช้ Supabase สำหรับฐานข้อมูลและจัดเก็บรูปภาพ

## ฟีเจอร์

- แสดงหมวดหมู่อาหารและรายการเมนู
- แสดงรายละเอียดอาหาร เช่น ราคา ส่วนผสม สารก่อภูมิแพ้ และข้อมูลโภชนาการ
- ให้พนักงานเข้าสู่ระบบเพื่อเพิ่ม แก้ไข ลบ และปรับสถานะเมนู
- ให้พนักงานเพิ่มหมวดหมู่อาหาร
- อัปโหลดรูปภาพเมนูไปยัง Supabase Storage

## เทคโนโลยี

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Font Awesome

## หน้าในระบบ

| URL | รายละเอียด |
| --- | --- |
| `/` | หน้าแรก |
| `/menu` | รายการหมวดหมู่อาหาร |
| `/menu/[category]` | เมนูอาหารในหมวดหมู่ |
| `/about` | ข้อมูลเกี่ยวกับโรงอาหาร |
| `/staff` | แดชบอร์ดสำหรับพนักงานและผู้ดูแลระบบ |
| `/admin` | เปลี่ยนเส้นทางไปยัง `/staff` |

## เริ่มต้นใช้งาน

### สิ่งที่ต้องเตรียม

- Node.js และ npm
- โปรเจกต์ Supabase ที่ตั้งค่าฐานข้อมูลและ Storage แล้ว

### ติดตั้งและรัน

```bash
npm ci
```

สร้างไฟล์ `.env.local` ที่โฟลเดอร์หลักของโปรเจกต์ แล้วกำหนดค่าต่อไปนี้:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

จากนั้นเริ่มเซิร์ฟเวอร์สำหรับพัฒนา:

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

> `SUPABASE_SERVICE_ROLE_KEY` เป็น secret key ที่ให้สิทธิ์ระดับสูง ต้องเก็บไว้ใน environment ฝั่งเซิร์ฟเวอร์เท่านั้น ห้ามใส่ prefix `NEXT_PUBLIC_` หรือ commit ไฟล์ `.env.local` ขึ้น GitHub

## การตั้งค่า Supabase

แอปต้องใช้ตารางต่อไปนี้:

- `categories`
- `dishes`
- `dish_ingredients`
- `dish_allergens`
- `chefs`
- `staff`
- `sessions`

และต้องมี Storage bucket ชื่อ `dish-images` สำหรับรูปภาพเมนู โดยแอปสร้าง public URL เพื่อแสดงรูปภาพ

โปรเจกต์นี้ไม่มีไฟล์ migration สำหรับสร้าง schema ของฐานข้อมูล ควรเตรียมตาราง ความสัมพันธ์ สิทธิ์การอ่านข้อมูลเมนู และ Storage bucket ใน Supabase ให้ตรงกับที่แอปใช้งานก่อน

## คำสั่งที่ใช้บ่อย

```bash
npm run dev    # เริ่มเซิร์ฟเวอร์สำหรับพัฒนา
npm run lint   # ตรวจสอบโค้ดด้วย ESLint
npm run build  # สร้าง production build
npm run start  # เริ่ม production server หลัง build
```

## โครงสร้างโปรเจกต์

```text
app/          หน้าเว็บและ API routes
components/   React components
data/         ข้อมูลที่ใช้ในแอป
lib/          Supabase clients และระบบ session
types/        TypeScript types
public/       ไฟล์ static
```
