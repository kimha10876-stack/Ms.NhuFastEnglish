import { cn } from '@/shared/utils/cn'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded border border-input bg-background px-3 py-2 text-base text-foreground',
        'placeholder:text-muted-foreground',
        'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
        className
      )}
      {...props}
    />
  )
}
