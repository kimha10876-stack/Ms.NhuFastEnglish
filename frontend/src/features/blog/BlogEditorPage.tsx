import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Eye,
  Edit3,
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Type,
  Image as ImageIcon,
  Quote,
  List,
  Loader2,
  CheckCircle,
  Folder,
  Calendar,
  User,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  useAdminBlogPostDetail,
  useCreateBlogPost,
  useUpdateBlogPost,
  useBlogCategories,
} from './useBlog'
import type { BlogPost } from './blog.types'

interface Block {
  id: string
  type: 'heading-lg' | 'heading-sm' | 'paragraph' | 'image' | 'quote' | 'list'
  content: string
}

function htmlToBlocks(html: string): Block[] {
  if (!html) return [{ id: Math.random().toString(), type: 'paragraph', content: '' }]
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const blocks: Block[] = []
  
  Array.from(doc.body.children).forEach((el) => {
    const id = Math.random().toString(36).substring(2, 9)
    if (el.tagName === 'H2') {
      blocks.push({ id, type: 'heading-lg', content: el.innerHTML })
    } else if (el.tagName === 'H3') {
      blocks.push({ id, type: 'heading-sm', content: el.innerHTML })
    } else if (el.tagName === 'BLOCKQUOTE') {
      blocks.push({ id, type: 'quote', content: el.innerHTML })
    } else if (el.tagName === 'IMG' || el.querySelector('img')) {
      const img = el.tagName === 'IMG' ? el : el.querySelector('img')
      blocks.push({ id, type: 'image', content: img?.getAttribute('src') || '' })
    } else if (el.tagName === 'UL') {
      const items = Array.from(el.querySelectorAll('li')).map(li => li.innerHTML).join('\n')
      blocks.push({ id, type: 'list', content: items })
    } else {
      // standard paragraph
      blocks.push({ id, type: 'paragraph', content: el.innerHTML })
    }
  })
  
  if (blocks.length === 0) {
    blocks.push({ id: Math.random().toString(36).substring(2, 9), type: 'paragraph', content: '' })
  }
  return blocks
}

function blocksToHtml(blocks: Block[]): string {
  return blocks.map((b) => {
    if (b.type === 'heading-lg') {
      return `<h2>${b.content}</h2>`
    } else if (b.type === 'heading-sm') {
      return `<h3>${b.content}</h3>`
    } else if (b.type === 'quote') {
      return `<blockquote>${b.content}</blockquote>`
    } else if (b.type === 'image') {
      return `<img src="${b.content}" alt="Blog Image" class="w-full rounded-xl my-6 border shadow-sm" />`
    } else if (b.type === 'list') {
      const items = b.content.split('\n').filter(line => line.trim() !== '')
      if (items.length === 0) return ''
      return `<ul>\n${items.map(item => `  <li>${item}</li>`).join('\n')}\n</ul>`
    } else {
      return `<p>${b.content}</p>`
    }
  }).join('\n')
}

export default function BlogEditorPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')

  // Post form state
  const [title, setTitle] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [summary, setSummary] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [blocks, setBlocks] = useState<Block[]>([
    { id: 'init-1', type: 'paragraph', content: '' }
  ])

  // Queries & Mutations
  const { data: categories = [] } = useBlogCategories()
  const { data: post, isLoading: loadingPost } = useAdminBlogPostDetail(id)

  const createPostMutation = useCreateBlogPost()
  const updatePostMutation = useUpdateBlogPost(id)

  // Populate data when editing
  useEffect(() => {
    if (post && isEdit) {
      setTitle(post.title)
      setThumbnailUrl(post.thumbnailUrl || '')
      setSummary(post.summary)
      setIsPublished(post.isPublished)
      setCategoryId(post.categoryId ?? '')
      setBlocks(htmlToBlocks(post.content))
    }
  }, [post, isEdit])

  // Block management actions
  const addBlock = (type: Block['type'], index?: number) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      content: ''
    }
    
    if (index !== undefined) {
      const updated = [...blocks]
      updated.splice(index + 1, 0, newBlock)
      setBlocks(updated)
    } else {
      setBlocks([...blocks, newBlock])
    }
  }

  const updateBlockContent = (blockId: string, content: string) => {
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, content } : b))
  }

  const changeBlockType = (blockId: string, type: Block['type']) => {
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, type } : b))
  }

  const deleteBlock = (blockId: string) => {
    if (blocks.length <= 1) {
      setBlocks([{ id: Math.random().toString(36).substring(2, 9), type: 'paragraph', content: '' }])
      return
    }
    setBlocks(blocks.filter(b => b.id !== blockId))
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === blocks.length - 1) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const updated = [...blocks]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setBlocks(updated)
  }

  const handleSave = () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết!')
      return
    }
    if (!summary.trim()) {
      alert('Vui lòng nhập tóm tắt bài viết!')
      return
    }

    const htmlContent = blocksToHtml(blocks)
    if (!htmlContent.trim()) {
      alert('Nội dung bài viết không được để trống!')
      return
    }

    const payload = {
      title: title.trim(),
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      summary: summary.trim(),
      content: htmlContent,
      isPublished,
      categoryId: categoryId === '' ? undefined : Number(categoryId),
    }

    const callbacks = {
      onSuccess: () => {
        navigate('/blog-management')
      },
      onError: (err: any) => {
        alert(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu bài viết!')
      }
    }

    if (isEdit) {
      updatePostMutation.mutate(payload, callbacks)
    } else {
      createPostMutation.mutate(payload, callbacks)
    }
  }

  // Pre-calculated preview HTML for mock presentation
  const previewHtml = blocksToHtml(blocks)

  if (isEdit && loadingPost) {
    return (
      <div className="min-h-svh bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 text-amber-500 animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Đang tải nội dung bài viết...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-[#F8F9FA] flex flex-col font-sans select-none">
      
      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/blog-management">
            <button className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="font-extrabold text-[15px] text-gray-900 tracking-tight leading-tight">
              {isEdit ? 'Chỉnh sửa bài đăng' : 'Tạo bài đăng mới'}
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Trình soạn thảo trực quan</p>
          </div>
        </div>

        {/* Edit / Preview Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'editor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Soạn thảo
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Xem trước public
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mr-2">
            <input
              type="checkbox"
              id="header-pub"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 accent-amber-500 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="header-pub" className="cursor-pointer select-none">Xuất bản bài viết</label>
          </div>
          
          <Button
            onClick={handleSave}
            disabled={createPostMutation.isPending || updatePostMutation.isPending}
            className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold text-xs rounded-xl px-5 h-[38px] flex items-center gap-1.5 shadow-sm"
          >
            {createPostMutation.isPending || updatePostMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Lưu bài viết
          </Button>
        </div>
      </header>

      {/* ── Main Canvas ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {activeTab === 'editor' ? (
          <>
            {/* 1. Main Editor Canvas */}
            <div className="flex-1 overflow-y-auto px-10 py-8 flex justify-center bg-gray-50">
              <div className="w-full max-w-[700px] bg-white border border-gray-150 rounded-3xl shadow-sm p-8 md:p-12 space-y-6 min-h-[80vh] flex flex-col">
                
                {/* Visual Title Editor */}
                <input
                  type="text"
                  placeholder="Nhập tiêu đề lớn bài viết ở đây..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-3xl font-extrabold text-gray-900 placeholder-gray-300 outline-none border-b border-transparent focus:border-gray-100 pb-3 transition-colors tracking-tight"
                />

                {/* Blocks Container */}
                <div className="flex-1 space-y-4 pt-4">
                  {blocks.map((block, idx) => {
                    const isParagraph = block.type === 'paragraph'
                    const isHeadingLg = block.type === 'heading-lg'
                    const isHeadingSm = block.type === 'heading-sm'
                    const isQuote = block.type === 'quote'
                    const isImage = block.type === 'image'
                    const isList = block.type === 'list'

                    return (
                      <div key={block.id} className="relative group rounded-2xl border border-transparent hover:border-gray-150 p-2 -mx-4 transition-all duration-200">
                        
                        {/* Hover Block Toolbar Controls */}
                        <div className="absolute right-2 -top-3.5 bg-white border border-gray-150 shadow-md rounded-lg py-0.5 px-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 select-none">
                          <button
                            onClick={() => moveBlock(idx, 'up')}
                            disabled={idx === 0}
                            title="Di chuyển lên"
                            className="p-1 rounded text-gray-400 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 transition-colors"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => moveBlock(idx, 'down')}
                            disabled={idx === blocks.length - 1}
                            title="Di chuyển xuống"
                            className="p-1 rounded text-gray-400 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 transition-colors"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                          
                          <span className="w-[1px] h-3 bg-gray-200 mx-1" />

                          {/* Block Converter Dropdown */}
                          <select
                            value={block.type}
                            onChange={(e) => changeBlockType(block.id, e.target.value as Block['type'])}
                            className="text-[10px] font-bold text-gray-500 bg-transparent outline-none cursor-pointer hover:text-gray-900 pr-1"
                          >
                            <option value="paragraph">Đoạn văn</option>
                            <option value="heading-lg">Tiêu đề lớn</option>
                            <option value="heading-sm">Tiêu đề nhỏ</option>
                            <option value="image">Hình ảnh</option>
                            <option value="quote">Trích dẫn</option>
                            <option value="list">Danh sách</option>
                          </select>

                          <span className="w-[1px] h-3 bg-gray-200 mx-1" />

                          <button
                            onClick={() => deleteBlock(block.id)}
                            title="Xóa thành phần"
                            className="p-1 rounded text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Block Editors */}
                        {isParagraph && (
                          <textarea
                            placeholder="Gõ nội dung đoạn văn của bạn ở đây..."
                            value={block.content}
                            onChange={(e) => updateBlockContent(block.id, e.target.value)}
                            rows={Math.max(2, block.content.split('\n').length)}
                            className="w-full text-[14px] text-gray-700 bg-transparent placeholder-gray-300 border-none outline-none resize-none leading-relaxed"
                          />
                        )}

                        {isHeadingLg && (
                          <input
                            type="text"
                            placeholder="Tiêu đề chương lớn (H2)..."
                            value={block.content}
                            onChange={(e) => updateBlockContent(block.id, e.target.value)}
                            className="w-full text-[19px] font-bold text-gray-900 bg-transparent placeholder-gray-300 border-none outline-none"
                          />
                        )}

                        {isHeadingSm && (
                          <input
                            type="text"
                            placeholder="Tiêu đề phụ nhỏ (H3)..."
                            value={block.content}
                            onChange={(e) => updateBlockContent(block.id, e.target.value)}
                            className="w-full text-[16px] font-bold text-gray-900 bg-transparent placeholder-gray-300 border-none outline-none"
                          />
                        )}

                        {isQuote && (
                          <div className="bg-gray-50 border-l-4 border-amber-500 p-3 rounded-r-xl">
                            <textarea
                              placeholder="Nhập nội dung trích dẫn nổi bật..."
                              value={block.content}
                              onChange={(e) => updateBlockContent(block.id, e.target.value)}
                              rows={2}
                              className="w-full text-[13px] font-medium italic text-gray-700 bg-transparent placeholder-gray-400 border-none outline-none resize-none leading-relaxed"
                            />
                          </div>
                        )}

                        {isImage && (
                          <div className="border border-dashed border-gray-200 bg-gray-50/50 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="h-4 w-4 text-gray-400 shrink-0" />
                              <input
                                type="text"
                                placeholder="Dán link ảnh URL ở đây..."
                                value={block.content}
                                onChange={(e) => updateBlockContent(block.id, e.target.value)}
                                className="flex-1 bg-white border border-gray-150 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-amber-500"
                              />
                            </div>
                            {block.content.trim() && (
                              <div className="aspect-[16/9] bg-white rounded-xl overflow-hidden border border-gray-150 relative">
                                <img
                                  src={block.content}
                                  alt="Preview"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none'
                                  }}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {isList && (
                          <div className="flex gap-2">
                            <List className="h-4 w-4 text-gray-400 shrink-0 mt-2" />
                            <textarea
                              placeholder="Nhập mỗi dòng là một gạch đầu dòng danh sách..."
                              value={block.content}
                              onChange={(e) => updateBlockContent(block.id, e.target.value)}
                              rows={Math.max(3, block.content.split('\n').length)}
                              className="w-full text-[13px] font-medium text-gray-700 bg-transparent placeholder-gray-400 border-none outline-none resize-none leading-relaxed"
                            />
                          </div>
                        )}

                        {/* Inline plus button between blocks */}
                        <div className="absolute left-1/2 -bottom-4 -translate-x-1/2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10">
                          <div className="bg-white border border-gray-200 shadow-md rounded-full px-2.5 py-1 flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-gray-400">Thêm:</span>
                            <button
                              onClick={() => addBlock('paragraph', idx)}
                              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-amber-600 transition-colors"
                              title="Đoạn văn"
                            >
                              <Type className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => addBlock('heading-lg', idx)}
                              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-amber-600 transition-colors font-extrabold text-[10px]"
                              title="Tiêu đề lớn"
                            >
                              H2
                            </button>
                            <button
                              onClick={() => addBlock('heading-sm', idx)}
                              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-amber-600 transition-colors font-extrabold text-[10px]"
                              title="Tiêu đề phụ"
                            >
                              H3
                            </button>
                            <button
                              onClick={() => addBlock('image', idx)}
                              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-amber-600 transition-colors"
                              title="Hình ảnh"
                            >
                              <ImageIcon className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => addBlock('quote', idx)}
                              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-amber-600 transition-colors"
                              title="Trích dẫn"
                            >
                              <Quote className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => addBlock('list', idx)}
                              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-amber-600 transition-colors"
                              title="Danh sách"
                            >
                              <List className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    )
                  })}
                </div>

                {/* Add Block at the bottom */}
                <div className="pt-6 border-t border-gray-100 mt-auto flex flex-col items-center gap-3">
                  <p className="text-xs font-bold text-gray-400">THÊM THÀNH PHẦN MỚI</p>
                  <div className="flex gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addBlock('paragraph')}
                      className="rounded-xl border-gray-200 text-xs font-bold h-9 flex items-center gap-1 hover:border-amber-500 hover:bg-amber-50"
                    >
                      <Type className="h-3.5 w-3.5 text-gray-400" />
                      Đoạn văn
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addBlock('heading-lg')}
                      className="rounded-xl border-gray-200 text-xs font-bold h-9 flex items-center gap-1 hover:border-amber-500 hover:bg-amber-50"
                    >
                      <span className="font-extrabold text-[10px] text-gray-400">H2</span>
                      Tiêu đề lớn
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addBlock('heading-sm')}
                      className="rounded-xl border-gray-200 text-xs font-bold h-9 flex items-center gap-1 hover:border-amber-500 hover:bg-amber-50"
                    >
                      <span className="font-extrabold text-[10px] text-gray-400">H3</span>
                      Tiêu đề phụ
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addBlock('image')}
                      className="rounded-xl border-gray-200 text-xs font-bold h-9 flex items-center gap-1 hover:border-amber-500 hover:bg-amber-50"
                    >
                      <ImageIcon className="h-3.5 w-3.5 text-gray-400" />
                      Hình ảnh
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addBlock('quote')}
                      className="rounded-xl border-gray-200 text-xs font-bold h-9 flex items-center gap-1 hover:border-amber-500 hover:bg-amber-50"
                    >
                      <Quote className="h-3.5 w-3.5 text-gray-400" />
                      Trích dẫn
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addBlock('list')}
                      className="rounded-xl border-gray-200 text-xs font-bold h-9 flex items-center gap-1 hover:border-amber-500 hover:bg-amber-50"
                    >
                      <List className="h-3.5 w-3.5 text-gray-400" />
                      Danh sách
                    </Button>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. Right Side Config Panel */}
            <div className="w-[300px] border-l border-gray-200 bg-white overflow-y-auto p-5 space-y-5 select-none shrink-0 hidden lg:block">
              <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Cấu hình bài viết</p>
              </div>

              {/* Cover Image Setting */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Ảnh bìa (Thumbnail URL)</label>
                <Input
                  placeholder="https://images.unsplash.com/photo-..."
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
                {thumbnailUrl.trim() ? (
                  <div className="aspect-[16/10] bg-gray-50 border rounded-xl overflow-hidden mt-2 relative">
                    <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-[16/10] bg-gray-50 border border-dashed rounded-xl flex items-center justify-center text-center p-3 mt-2 text-gray-400 text-[10px]">
                    Chưa có ảnh bìa
                  </div>
                )}
              </div>

              {/* Category Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Danh mục bài viết</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">Chưa phân loại</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Summary Editor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Tóm tắt ngắn gọn *</label>
                <textarea
                  placeholder="Tóm tắt ngắn 2-3 câu làm mô tả nhanh trên danh sách bài viết..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={4}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white outline-none focus:border-amber-500 resize-none leading-relaxed"
                />
              </div>

              {/* Status Info */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Thông tin lưu trữ</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Mã bài viết:</span>
                  <span className="font-semibold text-gray-700 max-w-[120px] truncate">{isEdit ? id : 'Tạo mới'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Trạng thái:</span>
                  {isPublished ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Xuất bản
                    </span>
                  ) : (
                    <span className="text-gray-500 font-bold">Bản nháp</span>
                  )}
                </div>
              </div>

            </div>
          </>
        ) : (
          /* ── Public Live Preview Tab ───────────────────────────────────── */
          <div className="flex-1 overflow-y-auto px-5 py-8 flex justify-center bg-gray-100">
            <div className="w-full max-w-[800px] flex flex-col space-y-6">
              
              <div className="bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold px-4 py-2.5 rounded-2xl flex items-center justify-between shadow-sm shrink-0">
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  Bạn đang xem bản hiển thị trước (Live Preview). Đây là giao diện chính xác mà học viên sẽ thấy khi đọc bài viết này trên trang public.
                </span>
              </div>

              {/* Public BlogPostDetailPage Layout */}
              <article className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 md:p-12 space-y-6">
                
                {/* Category tag */}
                {categoryId ? (
                  <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {categories.find(c => c.id === Number(categoryId))?.name || 'Category'}
                  </span>
                ) : (
                  <span className="inline-block bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Chưa phân loại
                  </span>
                )}

                {/* Title */}
                <h1 className="text-2xl md:text-3.5xl font-extrabold text-gray-900 leading-tight">
                  {title || 'Tiêu đề bài viết của bạn sẽ hiển thị ở đây'}
                </h1>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-semibold border-y border-gray-100 py-3.5">
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-gray-400" />
                    Đăng bởi: <strong className="text-gray-700">{post?.authorName || 'Tác giả của bạn'}</strong>
                  </span>
                  <span className="h-3 w-[1px] bg-gray-300 hidden sm:inline" />
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Ngày đăng: <strong className="text-gray-700">{new Date().toLocaleDateString('vi-VN')}</strong>
                  </span>
                  <span className="h-3 w-[1px] bg-gray-300 hidden sm:inline" />
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-gray-400" />
                    Lượt xem: <strong className="text-gray-700">{post?.viewCount || 0}</strong>
                  </span>
                </div>

                {/* Cover image */}
                {thumbnailUrl.trim() && (
                  <div className="aspect-[16/9] bg-gray-100 border rounded-2xl overflow-hidden shadow-sm">
                    <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Summary Block */}
                {summary.trim() && (
                  <div className="bg-gray-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                    <p className="text-sm font-semibold italic text-gray-700 leading-relaxed">
                      "{summary}"
                    </p>
                  </div>
                )}

                {/* Content Render (Parsed HTML) */}
                <div 
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                  className="text-gray-800 leading-relaxed text-[15px] space-y-4 pt-4 border-t border-gray-100
                    [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-gray-900
                    [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-gray-900
                    [&_p]:text-gray-700 [&_p]:mb-4
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1
                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1
                    [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-6 [&_img]:border [&_img]:border-gray-150 [&_img]:shadow-sm
                    [&_a]:text-amber-600 [&_a]:underline [&_a]:hover:text-amber-700"
                />

              </article>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
