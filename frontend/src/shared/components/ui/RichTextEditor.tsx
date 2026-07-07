import { useRef, useEffect, useState } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

const colors = [
  { name: 'Mặc định', value: '#111827' },
  { name: 'Xám', value: '#6B7280' },
  { name: 'Đỏ', value: '#EF4444' },
  { name: 'Cam', value: '#F59E0B' },
  { name: 'Xanh lá', value: '#10B981' },
  { name: 'Xanh dương', value: '#3B82F6' },
  { name: 'Tím', value: '#8B5CF6' },
]

export function RichTextEditor({ value, onChange, placeholder = 'Bắt đầu viết nội dung tại đây...' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isMounted = useRef(false)
  const [showColors, setShowColors] = useState(false)

  // Initialize editor content once on mount
  useEffect(() => {
    if (editorRef.current && !isMounted.current) {
      editorRef.current.innerHTML = value || ''
      isMounted.current = true
    }
  }, [value])

  // If value is cleared from outside (e.g. form reset), clear innerHTML
  useEffect(() => {
    if (editorRef.current && isMounted.current && !value) {
      editorRef.current.innerHTML = ''
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const executeCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value)
    handleInput()
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  const handleAddLink = () => {
    const url = prompt('Nhập địa chỉ URL liên kết (ví dụ: https://example.com):')
    if (url) {
      executeCommand('createLink', url)
    }
  }

  const handleAddImage = () => {
    const url = prompt('Nhập địa chỉ URL hình ảnh (ví dụ: https://images.unsplash.com/photo-...):')
    if (url) {
      executeCommand('insertImage', url)
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col focus-within:border-amber-500 transition-colors">
      
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1 items-center select-none">
        
        {/* Style selection */}
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<p>')}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
          title="Văn bản thường"
        >
          <Type className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h2>')}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors font-bold"
          title="Tiêu đề lớn"
        >
          <Heading1 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h3>')}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
          title="Tiêu đề nhỏ"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-gray-300 mx-1" />

        {/* Text styling */}
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors font-bold"
          title="Bôi đậm"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors italic"
          title="In nghiêng"
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('underline')}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors underline"
          title="Gạch chân"
        >
          <Underline className="h-4 w-4" />
        </button>

        {/* Text Color Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColors(!showColors)}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
            title="Màu chữ"
          >
            <span className="w-3.5 h-3.5 rounded-full border border-gray-400" style={{ backgroundColor: 'currentColor' }} />
          </button>
          
          {showColors && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 flex gap-1">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    executeCommand('foreColor', c.value)
                    setShowColors(false)
                  }}
                  className="w-5 h-5 rounded-full border border-black/10 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-gray-300 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
          title="Danh sách không thứ tự"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
          title="Danh sách có thứ tự"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-gray-300 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => executeCommand('justifyLeft')}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
          title="Căn lề trái"
        >
          <AlignLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('justifyCenter')}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
          title="Căn lề giữa"
        >
          <AlignCenter className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('justifyRight')}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
          title="Căn lề phải"
        >
          <AlignRight className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-gray-300 mx-1" />

        {/* Media / Link */}
        <button
          type="button"
          onClick={handleAddLink}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
          title="Chèn liên kết"
        >
          <LinkIcon className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={handleAddImage}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
          title="Chèn hình ảnh trực tuyến"
        >
          <ImageIcon className="h-4 w-4" />
        </button>

      </div>

      {/* Editor Body */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        className="flex-1 min-h-[300px] max-h-[500px] overflow-y-auto p-4 outline-none text-sm leading-relaxed prose max-w-none text-gray-900
          relative before:absolute before:text-gray-400 before:pointer-events-none empty:before:content-[attr(data-placeholder)] empty:before:block"
      />
    </div>
  )
}
