import { cn } from '@/shared/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded border border-input bg-background px-3 text-base text-foreground',
        'placeholder:text-muted-foreground',
        'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
        className
      )}
      {...props}
    />
  )
}
