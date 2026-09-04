import { useMemo } from 'react'
import {
  Megaphone,
  BookOpen,
  FileText,
  CheckSquare,
  Users,
  Info,
  DollarSign,
  History,
} from 'lucide-react'
import { ScrollableTabNav, type TabNavItem } from '@/shared/components/ScrollableTabNav'
import type { Tab } from './utils'

interface ClassDetailTabsProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  isStaff: boolean
  isStudent: boolean
  isTeacher: boolean
  isAdmin: boolean
  assignmentsCount: number
  membersCount: number
}

export function ClassDetailTabs({
  activeTab,
  onTabChange,
  isStaff,
  isStudent,
  isTeacher,
  isAdmin,
  assignmentsCount,
  membersCount,
}: ClassDetailTabsProps) {
  const tabs = useMemo((): TabNavItem<Tab>[] => {
    const items: TabNavItem<Tab>[] = [
      { id: 'announcements' as const, label: 'Bảng tin', icon: Megaphone },
    ]

    if (isTeacher) {
      items.push({ id: 'info' as const, label: 'Thông tin lớp', icon: Info })
    }

    items.push(
      { id: 'lessons' as const, label: 'Chương trình học', icon: BookOpen },
      { id: 'documents' as const, label: 'Tài liệu lớp', icon: FileText },
    )

    if (isStaff || isStudent) {
      items.push({
        id: 'assignments' as const,
        label: 'Bài tập về nhà',
        icon: CheckSquare,
        badge: assignmentsCount,
      })
    }

    if (isTeacher) {
      items.push({
        id: 'members' as const,
        label: 'Điểm danh & Thành viên',
        icon: Users,
        badge: membersCount,
      })
    }

    if (isAdmin) {
      items.push(
        { id: 'tuition' as const, label: 'Học phí', icon: DollarSign },
        { id: 'payment-history' as const, label: 'Lịch sử thanh toán', icon: History },
      )
    }

    return items
  }, [isStaff, isStudent, isTeacher, isAdmin, assignmentsCount, membersCount])

  return (
    <ScrollableTabNav
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      className="border-border"
    />
  )
}
