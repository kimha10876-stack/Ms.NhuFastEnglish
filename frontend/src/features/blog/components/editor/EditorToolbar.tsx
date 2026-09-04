import { Link } from 'react-router-dom'
import { ArrowLeft, Eye, Edit3, Save } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface EditorToolbarProps {
  isEdit: boolean
  activeTab: 'editor' | 'preview'
  isPublished: boolean
  isSaving: boolean
  onTabChange: (tab: 'editor' | 'preview') => void
  onPublishChange: (published: boolean) => void
  onSave: () => void
}

export function EditorToolbar({
  isEdit,
  activeTab,
  isPublished,
  isSaving,
  onTabChange,
  onPublishChange,
  onSave,
}: EditorToolbarProps) {
  return (
    <header className="sticky top-0 z-50 flex shrink-0 items-center justify-between border-b border-border bg-background px-6 py-3 shadow-sm">
      <div className="flex items-center gap-4">
        <Link to="/blog-management">
          <button
            type="button"
            className="rounded p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-ink-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-[15px] font-extrabold leading-tight tracking-tight text-ink-900">
            {isEdit ? 'Chỉnh sửa bài đăng' : 'Tạo bài đăng mới'}
          </h1>
          <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Trình soạn thảo trực quan
          </p>
        </div>
      </div>

      <div className="flex rounded bg-muted p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => onTabChange('editor')}
          className={`flex items-center gap-1.5 rounded px-4 py-1.5 transition-colors ${
            activeTab === 'editor'
              ? 'bg-background text-ink-900 shadow-sm'
              : 'text-muted-foreground hover:text-ink-900'
          }`}
        >
          <Edit3 className="h-3.5 w-3.5" />
          Soạn thảo
        </button>
        <button
          type="button"
          onClick={() => onTabChange('preview')}
          className={`flex items-center gap-1.5 rounded px-4 py-1.5 transition-colors ${
            activeTab === 'preview'
              ? 'bg-background text-ink-900 shadow-sm'
              : 'text-muted-foreground hover:text-ink-900'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          Xem trước public
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="mr-2 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <input
            type="checkbox"
            id="header-pub"
            checked={isPublished}
            onChange={(e) => onPublishChange(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded accent-primary-500 text-primary-500 focus:ring-primary-500"
          />
          <label htmlFor="header-pub" className="cursor-pointer select-none">
            Xuất bản bài viết
          </label>
        </div>

        <Button
          onClick={onSave}
          loading={isSaving}
          className="flex h-9 items-center gap-1.5 px-5 text-xs font-bold text-ink-900 shadow-sm"
        >
          <Save className="h-4 w-4" />
          Lưu bài viết
        </Button>
      </div>
    </header>
  )
}
