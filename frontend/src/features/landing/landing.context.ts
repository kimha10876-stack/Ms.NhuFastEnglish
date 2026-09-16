import { createContext, useContext } from 'react'

export interface LandingContextValue {
  centerName: string
  email: string
  address: string
  messengerUrl: string
  zaloPhone: string
  zaloDisplay: string
  isLoggedIn: boolean
  isStudent: boolean
  scrollToConsult: () => void
  scrollToSection: (id: string) => void
  scrollToTop: () => void
  pickCourse: (name: string) => void
}

const LandingContext = createContext<LandingContextValue | null>(null)

export const LandingProvider = LandingContext.Provider

export function useLanding() {
  const value = useContext(LandingContext)
  if (!value) throw new Error('useLanding must be used inside LandingProvider')
  return value
}
