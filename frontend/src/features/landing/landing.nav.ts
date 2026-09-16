export type LandingNavId = 'home' | 'gioi-thieu' | 'khoa-hoc' | 'giao-vien' | 'lien-he' | 'tin-tuc'

/**
 * Thứ tự section trên trang chủ — scroll spy.
 * Một menu có thể gồm nhiều section liên tiếp (cùng navId).
 */
export const LANDING_NAV_SECTIONS: { id: string; navId: LandingNavId }[] = [
  { id: 'trang-chu', navId: 'home' },
  { id: 'gioi-thieu', navId: 'gioi-thieu' },
  { id: 'gia-tri', navId: 'gioi-thieu' },
  { id: 'khoa-hoc', navId: 'khoa-hoc' },
  { id: 'bang-vang', navId: 'khoa-hoc' },
  { id: 'giao-vien', navId: 'giao-vien' },
  { id: 'lien-he', navId: 'lien-he' },
  { id: 'tin-tuc', navId: 'tin-tuc' },
]

export const NAV_LINK_CLASS =
  'inline-block whitespace-nowrap rounded-md px-3 py-2 font-body text-sm text-[#333333] transition-[color,background] hover:text-[#222222]'

export function navLinkActiveClass(active: boolean) {
  return active ? 'bg-[#f8cd0a] font-bold text-[#333333]' : ''
}
