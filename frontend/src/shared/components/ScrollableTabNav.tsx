import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

export interface TabNavItem<T extends string = string> {
  id: T
  label: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: number
}

interface ScrollableTabNavProps<T extends string> {
  tabs: TabNavItem<T>[]
  activeTab: T
  onTabChange: (tab: T) => void
  className?: string
}

export function ScrollableTabNav<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  className,
}: ScrollableTabNavProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    updateScrollButtons()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollButtons)
    const ro = new ResizeObserver(updateScrollButtons)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollButtons)
      ro.disconnect()
    }
  }, [updateScrollButtons, tabs.length])

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' })
  }

  return (
    <div className={cn('relative flex items-stretch border-b border-border', className)}>
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 flex h-full w-8 shrink-0 items-center justify-center bg-gradient-to-r from-background via-background to-transparent text-muted-foreground hover:text-foreground"
          aria-label="Cuộn tab sang trái"
        >
          <ChevronLeft className="h-4 w-4 text-gray-400" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex flex-nowrap overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                '-mb-px flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary font-semibold text-primary'
                  : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground',
              )}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              {tab.label}
              {tab.badge != null && tab.badge > 0 && (
                <TabBadge count={tab.badge} active={isActive} />
              )}
            </button>
          )
        })}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 flex h-full w-8 shrink-0 items-center justify-center bg-gradient-to-l from-background via-background to-transparent text-muted-foreground hover:text-foreground"
          aria-label="Cuộn tab sang phải"
        >
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </button>
      )}
    </div>
  )
}

function TabBadge({ count, active }: { count: number; active: boolean }) {
  return (
    <span
      className={cn(
        'rounded px-1.5 py-0.5 text-xs font-bold',
        active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground',
      )}
    >
      {count}
    </span>
  )
}
