import { Type, Image as ImageIcon, Quote, List } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import type { Block, BlockAlign, BlockType } from '../../utils/blockConverter'
import { BlockItem } from './BlockItem'

interface BlockEditorProps {
  title: string
  blocks: Block[]
  onTitleChange: (title: string) => void
  onAddBlock: (type: BlockType, index?: number) => void
  onMoveBlock: (index: number, direction: 'up' | 'down') => void
  onChangeBlockType: (blockId: string, type: BlockType) => void
  onChangeBlockAlign: (blockId: string, align: BlockAlign) => void
  onChangeBlockContent: (blockId: string, content: string) => void
  onDeleteBlock: (blockId: string) => void
}

export function BlockEditor({
  title,
  blocks,
  onTitleChange,
  onAddBlock,
  onMoveBlock,
  onChangeBlockType,
  onChangeBlockAlign,
  onChangeBlockContent,
  onDeleteBlock,
}: BlockEditorProps) {
  return (
    <div className="flex flex-1 justify-center overflow-y-auto bg-muted px-10 py-8">
      <div className="flex min-h-[80vh] w-full max-w-[700px] flex-col space-y-6 rounded-3xl border border-border bg-background p-8 shadow-sm md:p-12">
        <input
          type="text"
          placeholder="Nhập tiêu đề lớn bài viết ở đây..."
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full border-b border-transparent pb-3 text-3xl font-extrabold tracking-tight text-ink-900 outline-none transition-colors placeholder:text-gray-300 focus:border-border"
        />

        <div className="flex-1 space-y-4 pt-4">
          {blocks.map((block, idx) => (
            <BlockItem
              key={block.id}
              block={block}
              index={idx}
              totalBlocks={blocks.length}
              onMove={onMoveBlock}
              onChangeType={onChangeBlockType}
              onChangeAlign={onChangeBlockAlign}
              onChangeContent={onChangeBlockContent}
              onDelete={onDeleteBlock}
              onAddBlock={onAddBlock}
            />
          ))}
        </div>

        <div className="mt-auto flex w-full flex-col items-center gap-3 border-t border-border pt-6">
          <p className="text-xs font-bold text-muted-foreground">THÊM THÀNH PHẦN MỚI</p>
          <div className="flex w-full flex-wrap justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onAddBlock('paragraph')}
              className="flex h-9 shrink-0 items-center gap-1 rounded border-border text-xs font-bold hover:border-primary-500 hover:bg-primary-50"
            >
              <Type className="h-3.5 w-3.5 text-muted-foreground" />
              Đoạn văn
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onAddBlock('heading-lg')}
              className="flex h-9 shrink-0 items-center gap-1 rounded border-border text-xs font-bold hover:border-primary-500 hover:bg-primary-50"
            >
              <span className="text-xs font-extrabold text-muted-foreground">H2</span>
              Tiêu đề lớn
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onAddBlock('heading-sm')}
              className="flex h-9 shrink-0 items-center gap-1 rounded border-border text-xs font-bold hover:border-primary-500 hover:bg-primary-50"
            >
              <span className="text-xs font-extrabold text-muted-foreground">H3</span>
              Tiêu đề phụ
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onAddBlock('image')}
              className="flex h-9 shrink-0 items-center gap-1 rounded border-border text-xs font-bold hover:border-primary-500 hover:bg-primary-50"
            >
              <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
              Hình ảnh
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onAddBlock('quote')}
              className="flex h-9 shrink-0 items-center gap-1 rounded border-border text-xs font-bold hover:border-primary-500 hover:bg-primary-50"
            >
              <Quote className="h-3.5 w-3.5 text-muted-foreground" />
              Trích dẫn
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onAddBlock('list')}
              className="flex h-9 shrink-0 items-center gap-1 rounded border-border text-xs font-bold hover:border-primary-500 hover:bg-primary-50"
            >
              <List className="h-3.5 w-3.5 text-muted-foreground" />
              Danh sách
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
