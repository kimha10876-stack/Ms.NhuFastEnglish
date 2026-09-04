import { Building, BookOpen, FileText, Users } from 'lucide-react'
import { ScrollableTabNav } from '@/shared/components/ScrollableTabNav'

export type SettingsTabId = 'system' | 'categories' | 'roles' | 'blog-categories' | 'curriculum-templates'

const SETTINGS_TABS = [
  { id: 'system' as const, label: 'Thông tin trung tâm', icon: Building },
  { id: 'categories' as const, label: 'Danh mục lớp học', icon: BookOpen },
  { id: 'blog-categories' as const, label: 'Danh mục bài viết', icon: FileText },
  { id: 'curriculum-templates' as const, label: 'Khung giáo trình mẫu', icon: BookOpen },
  { id: 'roles' as const, label: 'Phân quyền thành viên', icon: Users },
]

interface SettingsTabNavProps {
  activeTab: SettingsTabId
  onChange: (tab: SettingsTabId) => void
}

export function SettingsTabNav({ activeTab, onChange }: SettingsTabNavProps) {
  return (
    <ScrollableTabNav
      tabs={SETTINGS_TABS}
      activeTab={activeTab}
      onTabChange={onChange}
      className="border-border"
    />
  )
}
