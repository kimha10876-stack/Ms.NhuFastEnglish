# Ms. Nhụ Fast English — Project Guide

## Stack
- **Frontend**: React 18 + Vite + TypeScript, TanStack Query, Zustand, React Router v6
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: ASP.NET Core 8 Web API, EF Core 8, PostgreSQL, Redis
- **Auth**: JWT (HS256) + Redis refresh tokens, BCrypt
- **Email**: MailKit → Brevo SMTP (smtp-relay.brevo.com:587)
- **Deploy**: Docker Compose, GitHub Actions (self-hosted runner)

## API Response Format
Mọi API đều trả về `{ code, message, data? }` — xem `ApiResponse.cs`.
Frontend unwrap: `r.data.data!` sau khi axios nhận response.

---

## Design System

**Artifact tham khảo**: https://claude.ai/code/artifact/91ec7139-0971-4c2b-9792-f02fa8fa94e1

### Palette (CSS variables)
| Token | Light | Dark | Dùng cho |
|-------|-------|------|----------|
| `--amber` | `#F59E0B` | `#FBBF24` | Primary button, link, focus ring |
| `--amber-hover` | `#D97706` | `#F59E0B` | Hover state |
| `--amber-light` | `#FEF3C7` | `rgba(251,191,36,.15)` | Badge bg, icon bg |
| `--bg` | `#FFFFFF` | `#111827` | Page background |
| `--surface` | `#F9FAFB` | `#1F2937` | Card, sidebar, input bg |
| `--border` | `#E5E7EB` | `#374151` | Dividers, input border |
| `--text` | `#111827` | `#F9FAFB` | Heading, body |
| `--muted` | `#6B7280` | `#9CA3AF` | Placeholder, caption |

Tailwind equivalents: amber-500/400, gray-900/50, gray-100/800, gray-200/700.

### Border Radius
- **Component nhỏ** (chip, badge, input-icon): `rounded-md` (6px)
- **Component vừa** (input, button-md, card nhỏ): `rounded-xl` (12px)
- **Component lớn** (card, modal, dialog): `rounded-2xl` (16px)
- **Pill** (badge, avatar): `rounded-full`

### Buttons — Tailwind classes
```
Primary   : bg-amber-500 text-gray-900 hover:bg-amber-600 font-semibold
Secondary : bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200
Outline   : border-1.5 border-amber-500 text-amber-600 hover:bg-amber-50
Ghost     : text-gray-600 hover:bg-gray-100
Destructive: bg-red-600 text-white hover:bg-red-700
```
Sizes: `h-8 px-3 text-xs` (SM) · `h-[38px] px-4 text-sm` (MD) · `h-11 px-5 text-[15px]` (LG)

### Inputs
```
Base  : h-[38px] px-3 rounded-xl border border-gray-200 bg-white text-sm
        focus:border-amber-500 focus:ring-3 focus:ring-amber-500/20 outline-none
Error : border-red-500 focus:ring-red-500/20
```

### Badges
```
Default : bg-gray-100 text-gray-700 border border-gray-200
Success : bg-emerald-50 text-emerald-700 border border-emerald-200
Error   : bg-red-50 text-red-700 border border-red-200
Warning : bg-amber-50 text-amber-700 border border-amber-200
Info    : bg-blue-50 text-blue-700 border border-blue-200
```

### Cards
```
Base    : bg-white border border-gray-200 rounded-2xl shadow-sm
Header  : px-5 py-4 border-b border-gray-200
Body    : p-5
Footer  : px-5 py-3 border-t border-gray-200 bg-gray-50
```
Dark: thay `bg-white` → `bg-gray-800`, `border-gray-200` → `border-gray-700`.

### Alerts
```
Success : bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800
Error   : bg-red-50 border-l-4 border-red-500 text-red-800
Warning : bg-amber-50 border-l-4 border-amber-500 text-amber-800
Info    : bg-blue-50 border-l-4 border-blue-500 text-blue-800
```

### Typography scale
| Size | Weight | Usage |
|------|--------|-------|
| `text-4xl font-extrabold tracking-tight` | 800 | Page hero H1 |
| `text-2xl font-bold tracking-tight` | 700 | Section title |
| `text-lg font-bold` | 700 | Card title |
| `text-sm font-semibold` | 600 | Label, button |
| `text-sm` | 400 | Body |
| `text-xs text-gray-500` | 400 | Caption, hint |
| `text-[11px] font-bold uppercase tracking-wider text-gray-400` | — | Section eyebrow |

### Icons
Dùng `lucide-react`. Size chuẩn: `h-4 w-4` (16px inline), `h-5 w-5` (20px standalone).
Icon thường dùng: BookOpen, Users, User, Calendar, Clock, Bell, Mail, Phone, Lock, Eye,
Edit, Trash2, Plus, Search, Filter, Download, Upload, Settings, RefreshCw, LogOut,
CheckCircle, XCircle, AlertTriangle, Info, ArrowLeft, ChevronRight, ChevronDown, DollarSign.

### Avatars
```
SM: w-7 h-7 text-[11px]   MD: w-9 h-9 text-sm   LG: w-12 h-12 text-base   XL: w-16 h-16 text-xl
bg-amber-100 text-amber-700 rounded-full font-bold
```
Group: `flex` với `[&>*:not(:first-child)]:-ml-2`.

### Tables
```
Wrapper  : overflow-x-auto border border-gray-200 rounded-2xl
<table>  : w-full text-sm border-collapse
<th>     : px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50
<td>     : px-4 py-3 border-t border-gray-100 text-gray-600
hover tr : hover:bg-gray-50
```

### Loading
```
Spinner: animate-spin border-2 border-gray-200 border-t-amber-500 rounded-full
         SM: h-3.5 w-3.5   MD: h-5 w-5   LG: h-8 w-8
Skeleton: animate-pulse bg-gray-200 rounded
```

### Modals / Dialogs
Dùng `shadcn Dialog`. Inner: `rounded-2xl` — tránh thêm class vào DialogContent của shadcn sẵn.

### Spacing rules
- Dùng `gap` trong flex/grid, không dùng margin lẻ
- Section spacing: `space-y-6` hoặc `gap-6`
- Card internal: `p-5` (body), `px-5 py-4` (header/footer)

---

## Folder structure (frontend)
```
src/
  features/auth/        ← login, forgot-password, register
  features/students/    ← danh sách, chi tiết học sinh
  features/teachers/    ← giáo viên
  features/classes/     ← lớp học, buổi học
  shared/
    api/                ← client.ts, types.ts
    components/ui/      ← shadcn components
```

## Folder structure (backend)
```
Controllers/   Services/   Models/Entities/   Models/DTOs/
Data/          Middleware/  Shared/ApiResponse.cs
```

## Seeded accounts
- Admin: `admin` / `123456`
- Teacher: `teacher` / `123456` (and `nampnhse173502@fpt.edu.vn` / `123456`)
