import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/utils/cn'

interface LimitedTextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'maxLength'> {
  maxLength: number
  value: string
  onValueChange: (value: string) => void
}

export function LimitedTextInput({
  maxLength,
  value,
  onValueChange,
  className,
  ...props
}: LimitedTextInputProps) {
  return (
    <div className="space-y-1">
      <Input
        {...props}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onValueChange(e.target.value.slice(0, maxLength))}
        className={cn(className)}
      />
      <p className="text-right text-xs text-muted-foreground">
        {value.length}/{maxLength}
      </p>
    </div>
  )
}
