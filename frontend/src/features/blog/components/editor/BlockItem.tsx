import {
  ChevronUp,
  ChevronDown,
  Type,
  Image as ImageIcon,
  Quote,
  List,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react'
import type { Block, BlockAlign, BlockType } from '../../utils/blockConverter'

interface BlockItemProps {
  block: Block
  index: number
  totalBlocks: number
  onMove: (index: number, direction: 'up' | 'down') => void
  onChangeType: (blockId: string, type: BlockType) => void
  onChangeAlign: (blockId: string, align: BlockAlign) => void
  onChangeContent: (blockId: string, content: string) => void
  onDelete: (blockId: string) => void
  onAddBlock: (type: BlockType, index: number) => void
}

export function BlockItem({
  block,
  index,
  totalBlocks,
  onMove,
  onChangeType,
  onChangeAlign,
  onChangeContent,
  onDelete,
  onAddBlock,
}: BlockItemProps) {
  const isParagraph = block.type === 'paragraph'
  const isHeadingLg = block.type === 'heading-lg'
  const isHeadingSm = block.type === 'heading-sm'
  const isQuote = block.type === 'quote'
  const isImage = block.type === 'image'
  const isList = block.type === 'list'

  return (
    <div className="group relative -mx-4 rounded-[8px] border border-transparent p-2 transition-all duration-200 hover:border-border">
      <div className="absolute -top-3.5 right-2 z-10 flex select-none items-center gap-0.5 rounded border border-border bg-background px-1 py-0.5 opacity-0 shadow-md transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onMove(index, 'up')}
          disabled={index === 0}
          title="Di chuyển lên"
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-ink-900 disabled:opacity-30"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onMove(index, 'down')}
          disabled={index === totalBlocks - 1}
          title="Di chuyển xuống"
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-ink-900 disabled:opacity-30"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>

        <span className="mx-1 h-3 w-[1px] bg-gray-200" />

        <select
          value={block.type}
          onChange={(e) => onChangeType(block.id, e.target.value as BlockType)}
          className="cursor-pointer bg-transparent pr-1 text-xs font-bold text-muted-foreground outline-none hover:text-ink-900"
        >
          <option value="paragraph">Đoạn văn</option>
          <option value="heading-lg">Tiêu đề lớn</option>
          <option value="heading-sm">Tiêu đề nhỏ</option>
          <option value="image">Hình ảnh</option>
          <option value="quote">Trích dẫn</option>
          <option value="list">Danh sách</option>
        </select>

        <span className="mx-1 h-3 w-[1px] bg-gray-200" />

        <button
          type="button"
          onClick={() => onChangeAlign(block.id, 'left')}
          title="Căn lề trái"
          className={`rounded p-1 transition-colors ${
            (block.align || 'left') === 'left'
              ? 'bg-primary-50 text-primary-500'
              : 'text-muted-foreground hover:bg-muted hover:text-ink-900'
          }`}
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onChangeAlign(block.id, 'center')}
          title="Căn giữa"
          className={`rounded p-1 transition-colors ${
            block.align === 'center'
              ? 'bg-primary-50 text-primary-500'
              : 'text-muted-foreground hover:bg-muted hover:text-ink-900'
          }`}
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onChangeAlign(block.id, 'right')}
          title="Căn lề phải"
          className={`rounded p-1 transition-colors ${
            block.align === 'right'
              ? 'bg-primary-50 text-primary-500'
              : 'text-muted-foreground hover:bg-muted hover:text-ink-900'
          }`}
        >
          <AlignRight className="h-3.5 w-3.5" />
        </button>

        <span className="mx-1 h-3 w-[1px] bg-gray-200" />

        <button
          type="button"
          onClick={() => onDelete(block.id)}
          title="Xóa thành phần"
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {isParagraph && (
        <textarea
          placeholder="Gõ nội dung đoạn văn của bạn ở đây..."
          value={block.content}
          onChange={(e) => onChangeContent(block.id, e.target.value)}
          rows={Math.max(2, block.content.split('\n').length)}
          style={{ textAlign: block.align || 'left' }}
          className="w-full resize-none border-none bg-transparent text-[14px] leading-relaxed text-foreground outline-none placeholder:text-gray-300"
        />
      )}

      {isHeadingLg && (
        <input
          type="text"
          placeholder="Tiêu đề chương lớn (H2)..."
          value={block.content}
          onChange={(e) => onChangeContent(block.id, e.target.value)}
          style={{ textAlign: block.align || 'left' }}
          className="w-full border-none bg-transparent text-[19px] font-bold text-ink-900 outline-none placeholder:text-gray-300"
        />
      )}

      {isHeadingSm && (
        <input
          type="text"
          placeholder="Tiêu đề phụ nhỏ (H3)..."
          value={block.content}
          onChange={(e) => onChangeContent(block.id, e.target.value)}
          style={{ textAlign: block.align || 'left' }}
          className="w-full border-none bg-transparent text-[16px] font-bold text-ink-900 outline-none placeholder:text-gray-300"
        />
      )}

      {isQuote && (
        <div className="rounded-r-xl border-l-4 border-primary-500 bg-muted p-3">
          <textarea
            placeholder="Nhập nội dung trích dẫn nổi bật..."
            value={block.content}
            onChange={(e) => onChangeContent(block.id, e.target.value)}
            rows={2}
            style={{ textAlign: block.align || 'left' }}
            className="w-full resize-none border-none bg-transparent text-[13px] font-medium italic leading-relaxed text-foreground outline-none placeholder:text-gray-400"
          />
        </div>
      )}

      {isImage && (
        <div className="space-y-3 rounded border border-dashed border-border bg-muted/50 p-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="Dán link ảnh URL ở đây..."
              value={block.content}
              onChange={(e) => onChangeContent(block.id, e.target.value)}
              className="flex-1 rounded border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary-500"
            />
          </div>
          {block.content.trim() && (
            <div style={{ textAlign: block.align || 'left' }}>
              <div className="relative inline-block aspect-[16/9] w-full max-w-[480px] overflow-hidden rounded border border-border bg-background text-left">
                <img
                  src={block.content}
                  alt="Preview"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {isList && (
        <div className="flex gap-2">
          <List className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <textarea
            placeholder="Nhập mỗi dòng là một gạch đầu dòng danh sách..."
            value={block.content}
            onChange={(e) => onChangeContent(block.id, e.target.value)}
            rows={Math.max(3, block.content.split('\n').length)}
            style={{ textAlign: block.align || 'left' }}
            className="w-full resize-none border-none bg-transparent text-[13px] font-medium leading-relaxed text-foreground outline-none placeholder:text-gray-400"
          />
        </div>
      )}

      <div className="absolute -bottom-4 left-1/2 z-10 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <div className="mx-auto flex flex-wrap items-center justify-center gap-1.5 rounded border border-border bg-background px-2.5 py-1.5 shadow-md">
          <span className="text-xs font-bold text-muted-foreground">Thêm:</span>
          <button
            type="button"
            onClick={() => onAddBlock('paragraph', index)}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-primary-600"
            title="Đoạn văn"
          >
            <Type className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onAddBlock('heading-lg', index)}
            className="rounded p-1 text-xs font-extrabold text-muted-foreground transition-colors hover:bg-muted hover:text-primary-600"
            title="Tiêu đề lớn"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => onAddBlock('heading-sm', index)}
            className="rounded p-1 text-xs font-extrabold text-muted-foreground transition-colors hover:bg-muted hover:text-primary-600"
            title="Tiêu đề phụ"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => onAddBlock('image', index)}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-primary-600"
            title="Hình ảnh"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onAddBlock('quote', index)}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-primary-600"
            title="Trích dẫn"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onAddBlock('list', index)}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-primary-600"
            title="Danh sách"
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
