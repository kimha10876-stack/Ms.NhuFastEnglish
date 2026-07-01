import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, Check, Loader2 } from 'lucide-react'
import { useSearchTeachers } from './useClasses'

interface TeacherSelectProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export default function TeacherSelect({ value, onChange, error, disabled = false }: TeacherSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch all teachers (since searchQuery is handled locally for instant filter)
  const { data: teachers = [], isLoading } = useSearchTeachers('')

  // Filter teachers list locally based on searchQuery
  const filteredTeachers = teachers.filter((t) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return t.fullName.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)
  })

  // Find currently selected teacher details
  const selectedTeacher = teachers.find((t) => t.teacherId === value)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setSearchQuery('')
    }
  }, [isOpen])

  const toggleDropdown = () => {
    if (!disabled) setIsOpen(!isOpen)
  }

  const handleSelect = (teacherId: string) => {
    onChange(teacherId)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* ── Trigger Button ── */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`w-full flex items-center justify-between h-[38px] px-3 rounded-xl border bg-white text-sm text-gray-900 transition-all outline-none text-left
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-amber-400'}
          ${isOpen ? 'border-amber-500 ring-2 ring-amber-500/20' : error ? 'border-red-500' : 'border-gray-200'}
        `}
      >
        {selectedTeacher ? (
          <div className="flex items-center gap-2 min-w-0">
            {selectedTeacher.avatarUrl ? (
              <img
                src={selectedTeacher.avatarUrl}
                alt={selectedTeacher.fullName}
                className="w-5 h-5 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-amber-700">
                  {selectedTeacher.fullName[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-medium truncate">{selectedTeacher.fullName}</span>
            <span className="text-xs text-gray-400 truncate hidden sm:inline">({selectedTeacher.email})</span>
          </div>
        ) : (
          <span className="text-gray-400">Chọn giáo viên phụ trách...</span>
        )}
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} />
      </button>

      {/* ── Dropdown Menu ── */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 z-[100] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-[300px] flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Box */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50 shrink-0">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Tìm kiếm giáo viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-900 border-none outline-none placeholder-gray-400 py-0.5"
            />
          </div>

          {/* Teacher List */}
          <div className="overflow-y-auto divide-y divide-gray-50 flex-1 py-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-6 text-gray-500 gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                <span className="text-sm">Đang tải giáo viên...</span>
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">
                Không tìm thấy giáo viên nào
              </div>
            ) : (
              filteredTeachers.map((t) => {
                const isSelected = t.teacherId === value
                return (
                  <button
                    key={t.teacherId}
                    type="button"
                    onClick={() => handleSelect(t.teacherId)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/50 transition-colors text-left
                      ${isSelected ? 'bg-amber-50/30' : ''}
                    `}
                  >
                    {t.avatarUrl ? (
                      <img
                        src={t.avatarUrl}
                        alt={t.fullName}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-amber-700">
                          {t.fullName[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isSelected ? 'text-amber-700' : 'text-gray-900'}`}>
                        {t.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{t.email}</p>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-amber-600 shrink-0 ml-auto" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
