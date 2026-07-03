import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  id: string | number
  name: string
}

interface CustomDropdownProps {
  value: string | number
  onChange: (val: any) => void
  options: Option[]
  placeholder?: string
}

export function CustomDropdown({ value, onChange, options, placeholder = 'Chọn...' }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find((o) => o.id === value)

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between h-[38px] px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 hover:border-amber-400 transition-all outline-none text-left cursor-pointer"
      >
        <span className="font-medium">{selectedOption?.name || placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 z-[100] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden py-1.5 flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="max-h-[250px] overflow-y-auto overflow-x-hidden">
            {options.map((opt) => {
              const isSelected = opt.id === value
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2 hover:bg-amber-50/50 transition-colors text-left text-sm font-medium ${
                    isSelected ? 'text-amber-700 bg-amber-50/30' : 'text-gray-700'
                  }`}
                >
                  <span className="truncate">{opt.name}</span>
                  {isSelected && <Check className="h-4 w-4 text-amber-600 shrink-0 ml-2" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
