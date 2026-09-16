import { Phone } from 'lucide-react'
import { useLanding } from '../landing.context'
import { ZALO_LOGO_URL } from '../landing.data'

function MessengerIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 44 44" fill="none" aria-hidden>
      <path
        d="M22.0498 0C34.4733 0 44.0019 9.07892 44.002 21.3418C44.002 36.8783 29.2621 45.5817 15.6631 41.8389C14.8675 41.6225 14.8068 41.7857 10.1133 43.8525C9.84917 43.9678 9.5608 44.0168 9.27344 43.9951C8.98594 43.9734 8.70779 43.8813 8.46387 43.7275C8.22013 43.5739 8.01758 43.3631 7.87402 43.1133C7.73046 42.8634 7.64962 42.582 7.63965 42.2939C7.51367 38.1803 7.66654 37.7942 6.92578 37.1279C2.63556 33.299 0 27.7558 0 21.3418C9.42193e-05 9.07896 9.62727 5.26025e-05 22.0498 0ZM35.29 16.4238C35.9154 15.4409 34.6996 14.3302 33.7734 15.0381L26.8174 20.3057C26.587 20.4784 26.3065 20.5723 26.0186 20.5723C25.7308 20.5722 25.4509 20.4783 25.2207 20.3057L20.0693 16.4502C19.7036 16.1771 19.2853 15.9818 18.8408 15.8779C18.3964 15.7741 17.9352 15.764 17.4863 15.8467C17.0373 15.9294 16.6098 16.1038 16.2314 16.3594C15.8532 16.6149 15.5315 16.9455 15.2871 17.3311L8.81152 27.584C8.18609 28.5661 9.40115 29.6771 10.3291 28.9736L17.2812 23.7012C17.5116 23.5284 17.7922 23.4346 18.0801 23.4346C18.3679 23.4346 18.6476 23.5285 18.8779 23.7012L24.0312 27.5576C24.397 27.8306 24.8153 28.0251 25.2598 28.1289C25.7042 28.2327 26.1654 28.2438 26.6143 28.1611C27.0633 28.0784 27.4907 27.9039 27.8691 27.6484C28.2474 27.393 28.5689 27.0622 28.8135 26.6768L35.29 16.4238Z"
        fill="#2C64F5"
      />
    </svg>
  )
}

export function FloatingActions() {
  const { messengerUrl, zaloPhone } = useLanding()

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3">
      <a
        href={`https://zalo.me/${zaloPhone}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Zalo"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-transform hover:scale-105"
      >
        <img src={ZALO_LOGO_URL} alt="" className="h-8 w-8 object-contain" />
      </a>
      <a
        href={messengerUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Messenger"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-transform hover:scale-105"
      >
        <MessengerIcon />
      </a>
      <a
        href={`tel:${zaloPhone}`}
        aria-label="Hotline"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-[#333333] shadow-lg ring-1 ring-primary/30 transition-transform hover:scale-105 hover:bg-primary-400"
      >
        <Phone className="h-5 w-5" />
      </a>
    </div>
  )
}
