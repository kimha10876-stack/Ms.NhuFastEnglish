import { FileText, File } from 'lucide-react'
import React from 'react'

export type Tab = 'announcements' | 'lessons' | 'documents' | 'assignments' | 'members' | 'info' | 'tuition' | 'payment-history'

export const CLASS_TABLE_PAGE_SIZE = 10

export function paginateList<T>(items: T[], page: number, pageSize = CLASS_TABLE_PAGE_SIZE) {
  const totalCount = items.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const activePage = Math.min(Math.max(page, 1), totalPages)
  const start = (activePage - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    totalCount,
    totalPages,
    activePage,
  }
}

export const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export const STATUS_OPTIONS = ['active', 'paused', 'ended']

export const STATUS_LABEL: Record<string, string> = {
  active: 'Đang hoạt động',
  paused: 'Tạm dừng',
  ended: 'Đã kết thúc',
}

export const STATUS_COLOR: Record<string, string> = {
  active: 'bg-success-bg text-success border-success/20',
  paused: 'bg-warning-bg text-warning border-warning/20',
  ended: 'bg-muted text-muted-foreground border-border',
}

export function formatContent(text: string) {
  if (!text) return ''
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>')
  escaped = escaped.replace(/__(.*?)__/g, '<u>$1</u>')
  escaped = escaped.replace(/\n/g, '<br />')

  const urlRegex = /(https?:\/\/[^\s]+)/g
  escaped = escaped.replace(
    urlRegex,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary-700 hover:underline break-all font-semibold">$1</a>'
  )

  return escaped
}

export function getFileIcon(fileType: string): React.ReactNode {
  const type = (fileType || '').toLowerCase()
  if (type.includes('pdf')) return React.createElement(FileText, { className: 'h-5 w-5 text-red-500' })
  if (type.includes('word') || type.includes('doc')) return React.createElement(FileText, { className: 'h-5 w-5 text-blue-500' })
  if (type.includes('ppt')) return React.createElement(FileText, { className: 'h-5 w-5 text-orange-500' })
  if (type.includes('youtube') || type.includes('video') || type.includes('mp4')) return React.createElement(File, { className: 'h-5 w-5 text-rose-600' })
  return React.createElement(File, { className: 'h-5 w-5 text-muted-foreground' })
}
