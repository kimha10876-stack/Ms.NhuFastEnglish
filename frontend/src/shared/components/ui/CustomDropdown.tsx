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
        className="w-full flex items-center justify-between gap-2 h-9 px-3 rounded border border-input bg-background text-sm text-foreground hover:border-primary-400 transition-all outline-none text-left cursor-pointer focus-visible:ring-[3px] focus-visible:ring-primary/40 min-w-0"
      >
        <span className="truncate font-medium min-w-0">{selectedOption?.name || placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${isOpen ? 'rotate-180 text-primary-500' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 z-[100] bg-popover border border-border rounded shadow-xl overflow-hidden py-1.5 flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
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
                  className={`w-full flex items-center justify-between px-4 py-2 hover:bg-primary-50/50 transition-colors text-left text-sm font-medium ${
                    isSelected ? 'text-primary-700 bg-primary-50/30' : 'text-foreground'
                  }`}
                >
                  <span className="truncate">{opt.name}</span>
                  {isSelected && <Check className="h-4 w-4 text-primary-600 shrink-0 ml-2" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
