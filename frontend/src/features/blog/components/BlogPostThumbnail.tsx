import { BookOpen } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import type { BlogPost } from '../blog.types'

export function BlogPostThumbnail({ post, className }: { post: BlogPost; className?: string }) {
  if (post.thumbnailUrl) {
    return (
      <img
        src={post.thumbnailUrl}
        alt={post.title}
        className={cn('h-full w-full object-cover', className)}
      />
    )
  }

  return (
    <div className={cn('flex h-full w-full items-center justify-center bg-primary-50', className)}>
      <BookOpen className="h-6 w-6 text-primary-600/50" />
    </div>
  )
}
