import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      closeButton
      toastOptions={{
        classNames: {
          toast: 'rounded border shadow-sm text-sm',
          title: 'font-semibold',
          description: 'opacity-90',
          success:
            '!bg-emerald-50 !border-emerald-200 !border-l-4 !border-l-emerald-500 !text-emerald-800 [&_[data-title]]:!text-emerald-800 [&_[data-description]]:!text-emerald-700 [&_[data-icon]]:!text-emerald-600',
          error:
            '!bg-red-50 !border-red-200 !border-l-4 !border-l-red-500 !text-red-800 [&_[data-title]]:!text-red-800 [&_[data-description]]:!text-red-700 [&_[data-icon]]:!text-red-600',
          info:
            '!bg-blue-50 !border-blue-200 !border-l-4 !border-l-blue-500 !text-blue-800 [&_[data-title]]:!text-blue-800 [&_[data-description]]:!text-blue-700 [&_[data-icon]]:!text-blue-600',
          closeButton:
            '!border-current/20 !bg-transparent !text-current/60 hover:!bg-black/5 hover:!text-current',
        },
      }}
    />
  )
}
