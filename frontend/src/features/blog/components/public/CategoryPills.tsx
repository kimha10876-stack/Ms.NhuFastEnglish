import type { BlogCategory } from '../../blog.types'

interface CategoryPillsProps {
  categories: BlogCategory[]
  selectedSlug: string
  onSelect: (slug: string) => void
}

export function CategoryPills({ categories, selectedSlug, onSelect }: CategoryPillsProps) {
  return (
    <div className="scrollbar-none flex select-none gap-2 overflow-x-auto pb-2">
      <button
        type="button"
        onClick={() => onSelect('')}
        className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
          selectedSlug === ''
            ? 'border-amber-500 bg-amber-500 text-gray-900 shadow-sm'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
        }`}
      >
        Tất cả bài viết
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.slug)}
          className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
            selectedSlug === cat.slug
              ? 'border-amber-500 bg-amber-500 text-gray-900 shadow-sm'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
