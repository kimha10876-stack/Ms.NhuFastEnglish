# Ms Nhu Fast English — Project Guide

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

## Design System (v2)

**Nguồn token duy nhất:** `frontend/src/styles/design-tokens.css`

### Brand
- **Primary (vàng):** `#F5C518` — nút submit, link, focus ring, active state
- **Ink (đen):** `--ink-900` — heading, text chính, sidebar
- Chữ trên nền primary: `--primary-foreground` (mực đậm), không dùng trắng

### Spacing & Radius
- Spacing: bội số 4px (`4, 8, 12, 16, 20, 24, 32, 40, 48, 64`)
- Radius: **4px duy nhất** (`rounded`) — ngoại lệ: avatar `rounded-full`
- Font min: **13px** (`text-xs`)

### Typography
`13px(xs) · 14px(sm/body) · 15px(base/input) · 16px(md) · 18px(lg/page title) · 22px(xl)`

### Controls
- Button/Input md: `h-9` (36px), `rounded`, `text-sm`
- Breakpoint desktop: `>=1024px` (`lg:`)
- PageLayout: max-width 1280px, padding 16px mobile / 24px desktop

### Primitives
Dùng component trong `frontend/src/shared/components/ui/` — Button, Input, Badge, Card, Avatar.
Không hardcode `amber-*`, `rounded-xl/2xl`, `text-[11px]`.

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
- Admin: `admin` (or `admin@gmail.com`) / `123456`
- Teacher 1: `teacher1` (or `teacher1@gmail.com`) / `123456`
- Teacher 2: `teacher2` (or `teacher2@gmail.com`) / `123456`
- Students: `student1` (or `student1@gmail.com`) to `student30` (or `student30@gmail.com`) / `123456`
