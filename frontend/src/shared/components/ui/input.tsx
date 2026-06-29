import { cn } from '@/shared/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-[38px] w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900',
        'placeholder:text-gray-400',
        'focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
        className
      )}
      {...props}
    />
  )
}
