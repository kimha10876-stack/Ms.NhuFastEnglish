import { CheckCircle } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import type { BlogCategory } from '../../blog.types'

interface PostSettingsPanelProps {
  isEdit: boolean
  postId: string
  thumbnailUrl: string
  summary: string
  categoryId: number | ''
  isPublished: boolean
  categories: BlogCategory[]
  onThumbnailChange: (url: string) => void
  onSummaryChange: (summary: string) => void
  onCategoryChange: (categoryId: number | '') => void
}

export function PostSettingsPanel({
  isEdit,
  postId,
  thumbnailUrl,
  summary,
  categoryId,
  isPublished,
  categories,
  onThumbnailChange,
  onSummaryChange,
  onCategoryChange,
}: PostSettingsPanelProps) {
  return (
    <div className="hidden w-[300px] shrink-0 select-none space-y-5 overflow-y-auto border-l border-border bg-background p-5 lg:block">
      <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cấu hình bài viết</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs">Ảnh bìa (Thumbnail URL)</label>
        <Input
          placeholder="https://images.unsplash.com/photo-..."
          value={thumbnailUrl}
          onChange={(e) => onThumbnailChange(e.target.value)}
          className="h-9 rounded text-xs"
        />
        {thumbnailUrl.trim() ? (
          <div className="relative mt-2 aspect-[16/10] overflow-hidden rounded border bg-muted">
            <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="mt-2 flex aspect-[16/10] items-center justify-center rounded border border-dashed bg-muted p-3 text-center text-xs text-muted-foreground">
            Chưa có ảnh bìa
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs">Danh mục bài viết</label>
        <select
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : '')}
          className="h-9 w-full cursor-pointer rounded-[8px] border border-border bg-background px-3 text-xs font-semibold outline-none focus:border-primary-500"
        >
          <option value="">Chưa phân loại</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs">Tóm tắt ngắn gọn *</label>
        <textarea
          placeholder="Tóm tắt ngắn 2-3 câu làm mô tả nhanh trên danh sách bài viết..."
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          rows={4}
          required
          className="w-full resize-none rounded-[8px] border border-border bg-background px-3 py-2 text-xs leading-relaxed outline-none focus:border-primary-500"
        />
      </div>

      <div className="space-y-2 rounded border border-border bg-muted p-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thông tin lưu trữ</p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Mã bài viết:</span>
          <span className="max-w-[120px] truncate font-semibold text-foreground">
            {isEdit ? postId : 'Tạo mới'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Trạng thái:</span>
          {isPublished ? (
            <span className="flex items-center gap-1 font-bold text-emerald-600">
              <CheckCircle className="h-3 w-3" /> Xuất bản
            </span>
          ) : (
            <span className="font-bold text-muted-foreground">Bản nháp</span>
          )}
        </div>
      </div>
    </div>
  )
}
