import { cn } from '@/shared/utils/cn'

interface BlogArticleBodyProps {
  html: string
  variant?: 'public' | 'admin'
  className?: string
}

const variantStyles = {
  public: cn(
    'text-gray-800 leading-relaxed text-[15px] space-y-4 pt-4 border-t border-gray-100',
    '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-gray-900',
    '[&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-gray-900',
    '[&_p]:text-gray-700 [&_p]:mb-4',
    '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1',
    '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1',
    '[&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-6 [&_img]:border [&_img]:border-gray-200 [&_img]:shadow-sm',
    '[&_a]:text-amber-600 [&_a]:underline [&_a]:hover:text-amber-700',
  ),
  admin: cn(
    'text-foreground leading-relaxed text-[15px] space-y-4 pt-4 border-t border-border',
    '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-ink-900',
    '[&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-ink-900',
    '[&_p]:text-foreground [&_p]:mb-4',
    '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1',
    '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1',
    '[&_img]:max-w-full [&_img]:rounded [&_img]:my-6 [&_img]:border [&_img]:border-border [&_img]:shadow-sm',
    '[&_a]:text-primary-600 [&_a]:underline [&_a]:hover:text-primary-700',
  ),
} as const

export function BlogArticleBody({ html, variant = 'public', className }: BlogArticleBodyProps) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className={cn(variantStyles[variant], className)}
    />
  )
}
