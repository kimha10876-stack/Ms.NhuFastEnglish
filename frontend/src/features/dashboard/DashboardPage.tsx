import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { GraduationCap, BookOpen, CreditCard, FileText } from 'lucide-react'

const stats = [
  { label: 'Học viên', value: '—', icon: GraduationCap, color: 'text-blue-500' },
  { label: 'Lớp đang mở', value: '—', icon: BookOpen, color: 'text-green-500' },
  { label: 'Học phí chưa đóng', value: '—', icon: CreditCard, color: 'text-orange-500' },
  { label: 'Bài chưa chấm', value: '—', icon: FileText, color: 'text-purple-500' },
]

export default function DashboardPage() {
  return (
    <div className="p-5 space-y-5">
      <h1 className="text-xl font-bold">Tổng quan</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="pb-1">
              <Icon className={`h-5 w-5 ${color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
